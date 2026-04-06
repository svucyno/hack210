import { Home, BarChart3, FileText, User, Camera, Sprout, MessageCircle, Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const navItems = [
  { key: "home" as const, icon: Home, path: "/" },
  { key: "market" as const, icon: BarChart3, path: "/market" },
  { key: "disease" as const, icon: Camera, path: "/disease" },
  { key: "cropAdvisor" as const, icon: Sprout, path: "/crop-advisor" },
  { key: "assistant" as const, icon: MessageCircle, path: "/assistant" },
  { key: "schemes" as const, icon: FileText, path: "/schemes" },
  { key: "profile" as const, icon: User, path: "/profile" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-black/80 backdrop-blur-xl border border-emerald-500/10 text-slate-200"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isMobileOpen ? 0 : "-100%" }}
        className="lg:animate-none lg:translate-x-0 fixed left-0 top-0 h-screen w-64 bg-black/80 backdrop-blur-xl border-r border-emerald-500/10 z-40 flex flex-col"
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-emerald-500/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold text-lg">🌾</span>
          </div>
          <h1 className="text-xl font-bold text-slate-200">{t("appName")}</h1>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute left-0 w-1 h-8 rounded-r-full bg-emerald-500"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <item.icon
                    size={20}
                    className={isActive ? "text-emerald-500" : "text-slate-400 group-hover:text-slate-200"}
                  />
                  <span className="text-sm font-medium">{t(item.key)}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </motion.aside>
    </>
  );
}
