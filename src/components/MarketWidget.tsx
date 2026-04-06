import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { useState } from "react";

const cropData = {
  cotton: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    price: 6800 + Math.sin(i / 4) * 400 + i * 15 + Math.random() * 100,
  })),
  wheat: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    price: 2400 + Math.cos(i / 5) * 150 + i * 8 + Math.random() * 50,
  })),
  paddy: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    price: 2100 + Math.sin(i / 3) * 200 + i * 5 + Math.random() * 80,
  })),
};

type CropKey = keyof typeof cropData;

export default function MarketWidget() {
  const { t } = useI18n();
  const [activeCrop, setActiveCrop] = useState<CropKey>("cotton");

  const crops: { key: CropKey; label: string; currentPrice: string; change: string }[] = [
    { key: "cotton", label: t("cotton"), currentPrice: "₹7,250", change: "+12%" },
    { key: "wheat", label: t("wheat"), currentPrice: "₹2,640", change: "+5%" },
    { key: "paddy", label: t("paddy"), currentPrice: "₹2,350", change: "+3%" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ delay: 0.1, duration: 0.2 }}
      className="rounded-2xl bg-[#141e14] border border-emerald-500/10 hover:border-emerald-500/30 transition-colors p-4 col-span-full md:col-span-2"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-200">{t("marketPrices")}</h3>
        <span className="text-xs text-slate-400">{t("trendDays")}</span>
      </div>

      {/* Crop tabs */}
      <div className="flex gap-2 mb-4">
        {crops.map((crop) => (
          <button
            key={crop.key}
            onClick={() => setActiveCrop(crop.key)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-colors ${
              activeCrop === crop.key
                ? "bg-emerald-500 text-white"
                : "bg-[#0d1410] text-slate-400 hover:bg-[#141e14] hover:text-slate-300"
            }`}
          >
            {crop.label}
          </button>
        ))}
      </div>

      {/* Price display */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-slate-200">
          {crops.find((c) => c.key === activeCrop)?.currentPrice}
        </span>
        <span className="text-xs font-medium text-emerald-400 flex items-center gap-0.5">
          <TrendingUp size={12} />
          {crops.find((c) => c.key === activeCrop)?.change}
        </span>
        <span className="text-xs text-slate-400">{t("pricePerQuintal")}</span>
      </div>

      {/* Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cropData[activeCrop]}>
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 10, fill: 'hsl(215 16% 60%)' }} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: "#141e14",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: "12px",
                fontSize: "12px",
                color: "#e2e8f0",
              }}
              formatter={(value: number) => [`₹${Math.round(value)}`, t("pricePerQuintal")]}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#10b981", stroke: "#4ade80", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
