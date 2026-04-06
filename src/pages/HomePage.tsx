import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import WeatherWidget from "@/components/WeatherWidget";
import MarketWidget from "@/components/MarketWidget";
import CropRecommendation from "@/components/CropRecommendation";
import AlertsWidget from "@/components/AlertsWidget";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="px-4 py-4 max-w-screen-xl mx-auto">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-4"
      >
        <h2 className="text-xl font-bold text-slate-200">{t("greeting")}</h2>
        <p className="text-sm text-slate-400">{t("todayOverview")}</p>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <WeatherWidget />
        <MarketWidget />
        <CropRecommendation />
        <AlertsWidget />
      </div>
    </div>
  );
}
