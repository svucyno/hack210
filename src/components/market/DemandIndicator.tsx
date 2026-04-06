import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

type DemandLevel = "high" | "medium" | "low";

interface DemandIndicatorProps {
  level: DemandLevel;
  cropName: string;
}

export default function DemandIndicator({ level, cropName }: DemandIndicatorProps) {
  const demandConfig = {
    high: {
      color: "text-[#A3FF12]",
      bg: "bg-[#A3FF12]/10",
      border: "border-[#A3FF12]/30",
      label: "HIGH DEMAND",
      bars: 3,
    },
    medium: {
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      border: "border-yellow-400/30",
      label: "MEDIUM DEMAND",
      bars: 2,
    },
    low: {
      color: "text-gray-400",
      bg: "bg-gray-400/10",
      border: "border-gray-400/30",
      label: "LOW DEMAND",
      bars: 1,
    },
  };

  const config = demandConfig[level];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-3 p-3 rounded-xl ${config.bg} border ${config.border}`}
    >
      <Activity className={config.color} size={20} />
      <div className="flex-1">
        <div className="text-xs text-gray-400">{cropName}</div>
        <Badge
          variant="outline"
          className={`${config.bg} ${config.color} ${config.border} text-[10px] font-bold mt-1`}
        >
          {config.label}
        </Badge>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={`w-1 h-6 rounded-full ${
              bar <= config.bars ? config.color.replace("text-", "bg-") : "bg-gray-700"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
