import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Bell } from "lucide-react";

export default function AlertsWidget() {
  const { t } = useI18n();

  const alerts = [
    {
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      title: t("weatherAlert"),
      message: t("heavyRainAlert"),
      type: "warning" as const,
    },
    {
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
      borderColor: "border-green-500/20",
      title: t("marketAlert"),
      message: t("priceUp"),
      type: "success" as const,
    },
    {
      icon: Bell,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      title: t("schemes"),
      message: t("schemeAlert"),
      type: "info" as const,
    },
  ];

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  // Alert item animation variants with fade-in
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="rounded-2xl bg-[#141e14] border border-emerald-500/10 p-6 col-span-full md:col-span-1 hover:border-emerald-500/30 transition-colors"
    >
      <h3 className="font-semibold text-slate-200 mb-4">{t("alerts")}</h3>
      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className={`${alert.bg} ${alert.borderColor} border rounded-xl p-3 flex items-start gap-3 transition-all duration-200 hover:scale-[1.02]`}
          >
            <alert.icon size={18} className={`${alert.color} mt-0.5 shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold ${alert.color} mb-1`}>
                {alert.title}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {alert.message}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
