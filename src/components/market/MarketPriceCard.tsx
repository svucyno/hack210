import { motion } from "framer-motion";
import { MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MarketPriceCardProps {
  marketName: string;
  district: string;
  price: number;
  change: number;
  isHighest?: boolean;
  isLowest?: boolean;
  index: number;
  lastUpdated?: string;
}

export default function MarketPriceCard({
  marketName,
  district,
  price,
  change,
  isHighest,
  isLowest,
  index,
  lastUpdated,
}: MarketPriceCardProps) {
  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`relative group overflow-hidden rounded-xl p-4 backdrop-blur-xl border transition-all duration-300 hover:scale-[1.02] ${
        isHighest
          ? "bg-gradient-to-br from-[#A3FF12]/10 to-transparent border-[#A3FF12]/30 hover:shadow-[0_0_20px_rgba(163,255,18,0.2)]"
          : isLowest
          ? "bg-gradient-to-br from-red-500/10 to-transparent border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
          : "bg-[#0B0F0C]/40 border-white/10 hover:border-[#A3FF12]/30"
      }`}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#A3FF12]/0 to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base mb-1 truncate">{marketName}</h3>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <MapPin size={11} />
              <span className="truncate">{district}</span>
            </div>
          </div>
          {(isHighest || isLowest) && (
            <Badge
              variant="outline"
              className={`ml-2 flex-shrink-0 ${
                isHighest
                  ? "bg-[#A3FF12]/20 text-[#A3FF12] border-[#A3FF12]/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              } text-[9px] font-semibold px-1.5 py-0.5`}
            >
              {isHighest ? "HIGH" : "LOW"}
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="mb-2">
          <div className="text-2xl font-bold text-white">
            ₹{price.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">per quintal</div>
        </div>

        {/* Updated Date */}
        {lastUpdated && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar size={11} />
            <span>{formatDate(lastUpdated)}</span>
          </div>
        )}
      </div>

      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#A3FF12]/10 via-transparent to-[#A3FF12]/10 blur-lg" />
      </div>
    </motion.div>
  );
}
