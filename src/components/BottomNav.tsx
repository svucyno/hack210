import { Home, BarChart3, FileText, User, Camera, Sprout, MessageCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";

const navItems = [
  { key: "home" as const, icon: Home, path: "/" },
  { key: "market" as const, icon: BarChart3, path: "/market" },
  { key: "disease" as const, icon: Camera, path: "/disease" },
  { key: "cropAdvisor" as const, icon: Sprout, path: "/crop-advisor" },
  { key: "assistant" as const, icon: MessageCircle, path: "/assistant" },
  { key: "schemes" as const, icon: FileText, path: "/schemes" },
  { key: "profile" as const, icon: User, path: "/profile" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-emerald-500/10 safe-bottom">
      <div className="flex items-center justify-around px-2 py-1" style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className="tap-target flex flex-col items-center gap-0.5 px-3 py-2 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 w-8 h-1 rounded-full bg-emerald-500"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon
                size={22}
                className={isActive ? "text-emerald-500" : "text-slate-400"}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-emerald-500" : "text-slate-400"
                }`}
              >
                {t(item.key)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
