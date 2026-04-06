import { motion } from "framer-motion";
import { Sparkles, TrendingUp, MapPin } from "lucide-react";

interface AISuggestionCardProps {
  suggestion: {
    title: string;
    description: string;
    market: string;
    expectedProfit: string;
  };
}

export default function AISuggestionCard({ suggestion }: AISuggestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl bg-gradient-to-br from-purple-500/10 via-[#A3FF12]/5 to-transparent border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-[#A3FF12]/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Glow effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#A3FF12]/20 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-[#A3FF12]/20 border border-purple-500/30">
            <Sparkles className="text-purple-300" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">AI Recommendation</h3>
            <p className="text-xs text-gray-400">Smart market insights</p>
          </div>
        </div>

        {/* Suggestion Content */}
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-white text-base mb-2">
              {suggestion.title}
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              {suggestion.description}
            </p>
          </div>

          {/* Market Info */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
            <MapPin className="text-[#A3FF12]" size={16} />
            <span className="text-sm text-gray-300">{suggestion.market}</span>
          </div>

          {/* Expected Profit */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#A3FF12]/10 to-transparent border border-[#A3FF12]/20">
            <div>
              <div className="text-xs text-gray-400 mb-1">Expected Profit</div>
              <div className="text-xl font-bold text-[#A3FF12]">
                {suggestion.expectedProfit}
              </div>
            </div>
            <TrendingUp className="text-[#A3FF12]" size={28} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
