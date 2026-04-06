import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Sprout, IndianRupee, CalendarDays, Droplet } from "lucide-react";

export default function CropRecommendation() {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-[#141e14] border border-emerald-500/10 p-4 col-span-full md:col-span-1 hover:border-emerald-500/30 transition-colors"
    >
      <h3 className="font-semibold text-slate-200 mb-3">{t("cropRecommendation")}</h3>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="relative rounded-xl overflow-hidden mb-4 border border-emerald-500/20"
      >
        <div className="agri-gradient p-4">
          <div className="flex items-center gap-2 mb-1">
            <Sprout size={20} className="text-primary-foreground" />
            <span className="text-xs font-medium text-primary-foreground/80">{t("bestCrop")}</span>
          </div>
          <div className="text-2xl font-bold text-primary-foreground">Groundnut 🥜</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="space-y-3"
      >
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45, duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <IndianRupee size={14} />
            {t("expectedProfit")}
          </div>
          <span className="text-sm font-semibold text-emerald-400">₹45,000/acre</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CalendarDays size={14} />
            {t("sowingDate")}
          </div>
          <span className="text-sm font-semibold text-slate-200">April 15–30</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55, duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Droplet size={14} />
            {t("waterNeeds")}
          </div>
          <span className="text-sm font-semibold text-blue-400">{t("medium")}</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
