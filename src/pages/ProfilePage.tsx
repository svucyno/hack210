import { useI18n, languageLabels, type Language } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import {
  User,
  MapPin,
  Globe,
  Sprout,
  LogOut,
  Shield,
  Database,
  HardDrive,
  Archive,
  Sun,
  Snowflake,
  Leaf,
  CloudRain,
  Activity,
  Clock,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const SEASONS = [
  { key: "spring", label: "Spring", icon: Leaf },
  { key: "summer", label: "Summer", icon: Sun },
  { key: "autumn", label: "Autumn", icon: CloudRain },
  { key: "winter", label: "Winter", icon: Snowflake },
] as const;

export default function ProfilePage() {
  const { t, lang, setLang } = useI18n();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{
    full_name: string;
    location: string;
  } | null>(null);
  const [activeSeason, setActiveSeason] = useState("summer");
  const [activeNav, setActiveNav] = useState("profile");
  const [syncIntegrity, setSyncIntegrity] = useState(98.2);
  const [isTerminalConnected, setIsTerminalConnected] = useState(true);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "en", label: "English (Intl)", flag: "🇺🇸" },
    { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
    { code: "te", label: "తెలుగు", flag: "🇮🇳" },
  ];

  const sideNavItems = [
    { key: "profile", label: "Profile Terminal", icon: User },
    { key: "security", label: "Node Security", icon: Shield },
    { key: "data", label: "Data Protocols", icon: Database },
    { key: "hardware", label: "Hardware Sync", icon: HardDrive },
    { key: "archive", label: "Cloud Archive", icon: Archive },
  ];

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, location")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [user]);

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Farmer";
  const location = profile?.location || "Guntur, AP";
  const coverage = "13.4k Hectares";

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.06 } },
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #0a0f0a 0%, #0d1410 30%, #0a100e 60%, #080d08 100%)",
      }}
    >
      {/* Top Navigation Bar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b px-6 py-3 flex items-center justify-between"
        style={{
          borderColor: "rgba(74,222,128,0.1)",
          background: "rgba(10,15,10,0.8)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-2">
          <Sprout size={20} style={{ color: "#4ade80" }} />
          <span className="text-sm font-bold text-green-300 tracking-wide italic">
            Emerald Vista Terminal
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {[
            "Global Fleet",
            "Soil Analysis",
            "Yield Forecast",
            "Harvest Log",
          ].map((item) => (
            <button
              key={item}
              className="text-xs text-gray-400 hover:text-green-400 transition-colors font-medium"
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#4ade80" }}
          />
          <span className="text-[10px] text-gray-500">ONLINE</span>
        </div>
      </motion.header>

      <div className="flex">
        {/* Left Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden md:flex flex-col w-56 border-r min-h-[calc(100vh-52px)] p-4"
          style={{
            borderColor: "rgba(74,222,128,0.08)",
            background: "rgba(10,18,10,0.5)",
          }}
        >
          {/* User Mini Profile */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(74,222,128,0.15)",
                  border: "1px solid rgba(74,222,128,0.3)",
                }}
              >
                <Sprout size={14} style={{ color: "#4ade80" }} />
              </div>
              <div>
                <p className="text-xs font-semibold text-green-200">
                  Lead Agronomist
                </p>
                <p className="text-[10px] text-gray-500">Terminal Node 01</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 flex-1">
            {sideNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveNav(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "text-green-300"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                  style={
                    isActive
                      ? {
                          background: "rgba(74,222,128,0.08)",
                          border: "1px solid rgba(74,222,128,0.15)",
                        }
                      : { border: "1px solid transparent" }
                  }
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="space-y-2 mt-4 border-t pt-4" style={{ borderColor: "rgba(74,222,128,0.08)" }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-lg py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              style={{
                background:
                  "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                color: "#0a1f0a",
                boxShadow: "0 4px 16px -4px rgba(34,197,94,0.4)",
              }}
            >
              <RefreshCw size={12} />
              Sync System
            </motion.button>

            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors">
              <Shield size={12} />
              Support
            </button>

            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400/70 hover:text-red-400 transition-colors"
            >
              <LogOut size={12} />
              Sign Out
            </button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <motion.main
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-52px)]"
        >
          {/* Page Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1
              className="text-2xl md:text-3xl font-extrabold mb-2"
              style={{ color: "#e2e8f0" }}
            >
              Terminal Node Configuration
            </h1>
            <p className="text-sm text-gray-500 max-w-lg">
              Adjust your global agronomist identity and data synchronization
              protocols for the upcoming growth cycle.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Profile Card */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(20,30,20,0.6)",
                  border: "1px solid rgba(74,222,128,0.1)",
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-24 h-24 rounded-xl overflow-hidden mb-4"
                    style={{
                      border: "2px solid rgba(74,222,128,0.2)",
                      boxShadow: "0 4px 20px -4px rgba(74,222,128,0.15)",
                    }}
                  >
                    <img
                      src="/farmer-avatar.png"
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center" style="background: rgba(74,222,128,0.1)"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>`;
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {displayName}
                  </h3>
                  <p
                    className="text-xs font-bold uppercase tracking-widest mt-1"
                    style={{ color: "#4ade80" }}
                  >
                    Chief Agronomist
                  </p>

                  <div className="flex items-center gap-8 mt-5">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                        Status
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: "#4ade80" }}
                        />
                        <span className="text-xs font-semibold text-green-300">
                          Active Node
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                        Coverage
                      </p>
                      <p className="text-xs font-semibold text-white mt-1">
                        {coverage}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Sync Integrity Card */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(20,30,20,0.6)",
                  border: "1px solid rgba(74,222,128,0.1)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity size={14} style={{ color: "#4ade80" }} />
                    Sync Integrity
                  </h4>
                  <span
                    className="text-lg font-bold"
                    style={{ color: "#4ade80" }}
                  >
                    {syncIntegrity}%
                  </span>
                </div>
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ background: "rgba(74,222,128,0.1)" }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${syncIntegrity}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #22c55e 0%, #4ade80 100%)",
                      boxShadow: "0 0 12px rgba(74,222,128,0.4)",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-4 text-[10px] text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">Last Data Burst</span>
                    <span className="text-gray-400 font-mono">
                      14:02:56 UTC
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">Uptime</span>
                    <span className="text-gray-400 font-mono">
                      4126 3.2h 44s
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Language Selection */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(20,30,20,0.6)",
                  border: "1px solid rgba(74,222,128,0.1)",
                }}
              >
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <Globe size={14} style={{ color: "#4ade80" }} />
                  Global Data Protocol
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {languages.map((l) => {
                    const isActive = lang === l.code;
                    return (
                      <button
                        key={l.code}
                        onClick={() => setLang(l.code)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
                        style={{
                          background: isActive
                            ? "rgba(74,222,128,0.12)"
                            : "rgba(255,255,255,0.03)",
                          border: isActive
                            ? "1px solid rgba(74,222,128,0.3)"
                            : "1px solid rgba(255,255,255,0.05)",
                          color: isActive ? "#86efac" : "#9ca3af",
                        }}
                      >
                        <span className="text-sm">{l.flag}</span>
                        <span>{l.label}</span>
                        {isActive && (
                          <div
                            className="w-2 h-2 rounded-full ml-auto"
                            style={{ background: "#4ade80" }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Season / Operational Cycle */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(20,30,20,0.6)",
                  border: "1px solid rgba(74,222,128,0.1)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sprout size={14} style={{ color: "#4ade80" }} />
                    Operational Cycle
                  </h4>
                  <span
                    className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(74,222,128,0.08)",
                      border: "1px solid rgba(74,222,128,0.15)",
                      color: "#86efac",
                    }}
                  >
                    AUTO-DETECTED
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 mb-3">
                  {SEASONS.slice(0, 3).map((season) => {
                    const Icon = season.icon;
                    const isActive = activeSeason === season.key;
                    return (
                      <button
                        key={season.key}
                        onClick={() => setActiveSeason(season.key)}
                        className="flex flex-col items-center gap-2 py-4 rounded-xl text-xs font-medium transition-all duration-200"
                        style={{
                          background: isActive
                            ? "linear-gradient(135deg, rgba(74,222,128,0.15) 0%, rgba(74,222,128,0.08) 100%)"
                            : "rgba(255,255,255,0.03)",
                          border: isActive
                            ? "1px solid rgba(74,222,128,0.3)"
                            : "1px solid rgba(255,255,255,0.05)",
                          color: isActive ? "#86efac" : "#6b7280",
                          boxShadow: isActive
                            ? "0 4px 16px -4px rgba(74,222,128,0.2)"
                            : "none",
                        }}
                      >
                        <Icon size={20} />
                        <span className="uppercase tracking-wider text-[10px] font-bold">
                          {season.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-center">
                  {SEASONS.slice(3).map((season) => {
                    const Icon = season.icon;
                    const isActive = activeSeason === season.key;
                    return (
                      <button
                        key={season.key}
                        onClick={() => setActiveSeason(season.key)}
                        className="flex flex-col items-center gap-2 py-4 px-8 rounded-xl text-xs font-medium transition-all duration-200"
                        style={{
                          background: isActive
                            ? "linear-gradient(135deg, rgba(74,222,128,0.15) 0%, rgba(74,222,128,0.08) 100%)"
                            : "rgba(255,255,255,0.03)",
                          border: isActive
                            ? "1px solid rgba(74,222,128,0.3)"
                            : "1px solid rgba(255,255,255,0.05)",
                          color: isActive ? "#86efac" : "#6b7280",
                        }}
                      >
                        <Icon size={20} />
                        <span className="uppercase tracking-wider text-[10px] font-bold">
                          {season.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-end gap-3"
              >
                <button
                  className="px-5 py-2.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors"
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  Reset Local Defaults
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 rounded-lg text-xs font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    color: "#fff",
                    boxShadow: "0 4px 16px -4px rgba(239,68,68,0.4)",
                  }}
                >
                  Save Configuration
                </motion.button>
              </motion.div>
            </div>
          </div>

          {/* Terminal Disconnect Warning */}
          <motion.div
            variants={itemVariants}
            className="mt-6 rounded-2xl p-4 flex items-center justify-between"
            style={{
              background: "rgba(30,20,20,0.5)",
              border: "1px solid rgba(239,68,68,0.15)",
            }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={18}
                className="mt-0.5 flex-shrink-0"
                style={{ color: "#f87171" }}
              />
              <div>
                <h5 className="text-sm font-bold text-white">
                  Terminal Disconnect
                </h5>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Warning: Severing this node connection will halt all live soil
                  telemetry syncing.
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsTerminalConnected(!isTerminalConnected)}
              className="px-4 py-2 rounded-lg text-xs font-bold flex-shrink-0"
              style={{
                background: isTerminalConnected
                  ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                  : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                color: "#fff",
                boxShadow: isTerminalConnected
                  ? "0 4px 16px -4px rgba(239,68,68,0.4)"
                  : "0 4px 16px -4px rgba(34,197,94,0.4)",
              }}
            >
              {isTerminalConnected ? "DISCONNECT" : "RECONNECT"}
            </motion.button>
          </motion.div>

          {/* Mobile Sign Out */}
          <motion.div variants={itemVariants} className="md:hidden mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={signOut}
              className="w-full rounded-xl p-4 flex items-center gap-3 text-red-400 transition-colors"
              style={{
                background: "rgba(30,20,20,0.4)",
                border: "1px solid rgba(239,68,68,0.15)",
              }}
            >
              <LogOut size={16} />
              <span className="text-sm font-semibold">Sign Out</span>
            </motion.button>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
}
