import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sprout,
  ArrowRight,
  Loader2,
  Satellite,
  ScanLine,
  Phone,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [scanTime, setScanTime] = useState("4m AGO");

  // Simulate satellite scan timer
  useEffect(() => {
    const interval = setInterval(() => {
      const mins = Math.floor(Math.random() * 10) + 1;
      setScanTime(`${mins}m AGO`);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: fullName,
              phone,
              location,
            },
          },
        });
        if (error) throw error;
        toast({
          title: "Account created! 🌱",
          description: "Check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Enter your email first",
        variant: "destructive",
      });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check your email",
        description: "Password reset link sent!",
      });
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: isSignUp ? 40 : -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
    },
    exit: {
      opacity: 0,
      x: isSignUp ? -40 : 40,
      transition: { duration: 0.3 },
    },
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Full-screen background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/farm-bg.png"
          alt="Farm landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
      </div>

      {/* Left purple accent bar */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute left-0 top-0 bottom-0 w-2 z-10"
        style={{
          background:
            "linear-gradient(to bottom, #7c3aed, #6d28d9, #5b21b6, transparent)",
        }}
      />

      {/* Main Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="rounded-3xl p-8 md:p-10"
          style={{
            background:
              "linear-gradient(145deg, rgba(30,35,30,0.88) 0%, rgba(20,25,20,0.92) 50%, rgba(15,18,15,0.95) 100%)",
            backdropFilter: "blur(24px) saturate(1.4)",
            WebkitBackdropFilter: "blur(24px) saturate(1.4)",
            border: "1px solid rgba(100, 200, 100, 0.12)",
            boxShadow:
              "0 32px 64px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sprout size={28} className="text-green-400" />
              <span className="text-xl font-bold text-white tracking-wide">
                AgriDash
              </span>
            </div>
            <p className="text-[11px] text-gray-400 uppercase tracking-[0.25em]">
              THE DIGITAL AGRONOMIST
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.form
              key={String(isSignUp)}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleSubmit}
            >
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {/* Header Text */}
                <motion.div variants={itemVariants} className="mb-2">
                  <h2 className="text-2xl font-bold text-white">
                    {isSignUp ? "Create Account" : "Welcome Back"}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {isSignUp
                      ? "Join the digital farming revolution."
                      : "Access your field insights and harvest analytics."}
                  </p>
                </motion.div>

                {/* Full Name (sign up only) */}
                <AnimatePresence>
                  {isSignUp && (
                    <motion.div
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    >
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                        Full Name
                      </label>
                      <div className="relative">
                        <User
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-all duration-200 focus:ring-1 focus:ring-green-500/50"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                          required={isSignUp}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email / Farmer ID */}
                <motion.div variants={itemVariants}>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                    Farmer ID / Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your ID"
                      className="w-full rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-all duration-200 focus:ring-1 focus:ring-green-500/50"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                      required
                    />
                  </div>
                </motion.div>

                {/* Phone (sign up only) */}
                <AnimatePresence>
                  {isSignUp && (
                    <motion.div
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    >
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-all duration-200 focus:ring-1 focus:ring-green-500/50"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Location (sign up only) */}
                <AnimatePresence>
                  {isSignUp && (
                    <motion.div
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    >
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Guntur, Andhra Pradesh"
                          className="w-full rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-all duration-200 focus:ring-1 focus:ring-green-500/50"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Password */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Password
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-medium"
                      >
                        Forgot Access?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl pl-11 pr-12 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-all duration-200 focus:ring-1 focus:ring-green-500/50"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Keep me signed in (login only) */}
                {!isSignUp && (
                  <motion.div variants={itemVariants}>
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div
                        className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${
                          keepSignedIn
                            ? "bg-green-500 border-green-500"
                            : "border-gray-600 group-hover:border-gray-400"
                        }`}
                        onClick={() => setKeepSignedIn(!keepSignedIn)}
                      >
                        {keepSignedIn && (
                          <svg
                            width="10"
                            height="8"
                            viewBox="0 0 10 8"
                            fill="none"
                          >
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                        Keep me signed in
                      </span>
                    </label>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.div variants={itemVariants} className="pt-1">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-300"
                    style={{
                      background:
                        "linear-gradient(135deg, #86efac 0%, #4ade80 40%, #22c55e 100%)",
                      color: "#0a1f0a",
                      boxShadow:
                        "0 8px 32px -8px rgba(74,222,128,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                    }}
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        {isSignUp ? "Create Partner Account" : "Secure Login"}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>
                </motion.div>

                {/* Toggle sign up / sign in */}
                <motion.div
                  variants={itemVariants}
                  className="text-center pt-2"
                >
                  <p className="text-xs text-gray-500 mb-2">
                    {isSignUp
                      ? "Already have an account?"
                      : "New to the platform?"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="w-full rounded-xl py-3 text-sm font-bold transition-all duration-200 hover:bg-white/10"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#e5e7eb",
                    }}
                  >
                    {isSignUp ? "Sign In Instead" : "Create Partner Account"}
                  </button>
                </motion.div>

                {/* Built for Indian Farmers */}
                <motion.div
                  variants={itemVariants}
                  className="text-center pt-2"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ background: "#4ade80" }}
                    />
                    <span
                      className="text-[11px] font-semibold uppercase tracking-widest"
                      style={{ color: "rgba(74,222,128,0.7)" }}
                    >
                      Built for Indian Farmers
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Bottom-left satellite status indicators */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-6 z-10 space-y-2"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#facc15" }}
          />
          <span className="text-[10px] font-medium text-gray-300 uppercase tracking-wider">
            <Satellite
              size={12}
              className="inline mr-1"
              style={{ color: "#facc15" }}
            />
            Satellite Status: Connected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "#4ade80" }}
          />
          <span className="text-[10px] font-medium text-gray-300 uppercase tracking-wider">
            <ScanLine
              size={12}
              className="inline mr-1"
              style={{ color: "#4ade80" }}
            />
            Latest Scan: {scanTime}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
