import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MarketSummary } from "../types";

interface BestWorstCardProps {
  type: "best" | "worst";
  market: MarketSummary | null;
  loading?: boolean;
}

export default function BestWorstCard({ type, market, loading = false }: BestWorstCardProps) {
  const isBest = type === "best";

  if (loading) {
    return (
      <div className="h-40 bg-white/5 rounded-xl animate-pulse" />
    );
  }

  if (!market) {
    return (
      <div className="relative overflow-hidden rounded-xl p-5 backdrop-blur-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
        <p className="text-gray-400 text-center text-sm">No data available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className={`relative overflow-hidden rounded-xl p-5 backdrop-blur-xl bg-gradient-to-br border transition-all duration-300 hover:scale-[1.01] ${
        isBest
          ? "from-[#A3FF12]/10 to-transparent border-[#A3FF12]/30 hover:shadow-[0_0_25px_rgba(163,255,18,0.2)]"
          : "from-red-500/10 to-transparent border-red-500/30 hover:shadow-[0_0_25px_rgba(239,68,68,0.2)]"
      }`}
    >
      {/* Glow effect */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl ${
          isBest ? "bg-[#A3FF12]/15" : "bg-red-500/15"
        }`}
      />

      <div className="relative z-10">
        {/* Badge */}
        <Badge
          className={`mb-2.5 ${
            isBest
              ? "bg-[#A3FF12]/20 text-[#A3FF12] border-[#A3FF12]/30"
              : "bg-red-500/20 text-red-400 border-red-500/30"
          } text-[10px] font-semibold px-2 py-0.5`}
        >
          {isBest ? "BEST PRICE" : "LOWEST PRICE"}
        </Badge>

        {/* Market Name */}
        <h3 className="text-white font-bold text-lg mb-1.5">{market.market}</h3>

        {/* District */}
        <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-3">
          <MapPin size={12} />
          {market.district}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span
            className={`text-3xl font-bold ${
              isBest ? "text-[#A3FF12]" : "text-red-400"
            }`}
          >
            ₹{market.price.toLocaleString()}
          </span>
          {market.change !== 0 && (
            <div
              className={`flex items-center gap-0.5 text-xs ${
                market.change > 0 ? "text-[#A3FF12]" : "text-red-400"
              }`}
            >
              {market.change > 0 ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              <span className="font-semibold">
                {market.change > 0 ? "+" : ""}
                {market.change}%
              </span>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <p className="text-xs text-gray-500 mt-2.5">
          Updated: {new Date(market.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
    </motion.div>
  );
}
