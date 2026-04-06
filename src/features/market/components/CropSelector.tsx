import { useMemo } from "react";
import { motion } from "framer-motion";
import { CropInfo } from "../types";
import { useI18n } from "@/lib/i18n";

interface CropSelectorProps {
  crops: CropInfo[];
  selectedCrop: string | null;
  onSelectCrop: (cropName: string) => void;
  loading?: boolean;
}

export default function CropSelector({
  crops,
  selectedCrop,
  onSelectCrop,
  loading = false,
}: CropSelectorProps) {
  const { lang } = useI18n();

  // Get crop name based on language
  const getCropName = (crop: CropInfo) => {
    if (lang === "hi") return crop.nameHi;
    if (lang === "te") return crop.nameTe;
    return crop.name;
  };

  // Group crops by category
  const groupedCrops = useMemo(() => {
    const groups: Record<string, CropInfo[]> = {};
    crops.forEach((crop) => {
      if (!groups[crop.category]) {
        groups[crop.category] = [];
      }
      groups[crop.category].push(crop);
    });
    return groups;
  }, [crops]);

  if (loading) {
    return (
      <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-[#0B0F0C]/40 border border-white/10"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white">Select Crop</h3>
        <p className="text-xs text-gray-400 mt-0.5">{crops.length} available</p>
      </div>

      {/* Crop List */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {Object.entries(groupedCrops).map(([category, categoryCrops]) => (
          <div key={category} className="border-b border-white/5 last:border-0">
            {/* Category Header */}
            <div className="px-4 py-2 bg-white/5">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {category}
              </h4>
            </div>

            {/* Crop Items */}
            <div className="divide-y divide-white/5">
              {categoryCrops.map((crop) => {
                const isSelected = selectedCrop === crop.name;
                return (
                  <button
                    key={crop.name}
                    onClick={() => onSelectCrop(crop.name)}
                    className={`
                      w-full px-4 py-2.5 text-left transition-all duration-200
                      ${
                        isSelected
                          ? "bg-[#A3FF12]/10 border-l-2 border-[#A3FF12] text-[#A3FF12] font-medium"
                          : "text-gray-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
                      }
                    `}
                  >
                    <span className="text-sm">{getCropName(crop)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
