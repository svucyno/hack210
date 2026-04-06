import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ProfitCalculatorProps {
  basePrice: number;
}

export default function ProfitCalculator({ basePrice }: ProfitCalculatorProps) {
  const [transportCost, setTransportCost] = useState<string>("");
  const [finalProfit, setFinalProfit] = useState<number | null>(null);

  const calculateProfit = () => {
    const cost = parseFloat(transportCost) || 0;
    const profit = basePrice - cost;
    setFinalProfit(profit);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl bg-gradient-to-br from-[#0B0F0C]/60 to-[#0B0F0C]/40 border border-white/5 hover:border-[#A3FF12]/20 transition-all duration-300"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#A3FF12]/5 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-[#A3FF12]/10 border border-[#A3FF12]/20">
            <Calculator className="text-[#A3FF12]" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Profit Calculator</h3>
            <p className="text-xs text-gray-400">Calculate your net profit</p>
          </div>
        </div>

        {/* Base Price Display */}
        <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-xs text-gray-400 mb-1">Base Market Price</div>
          <div className="text-2xl font-bold text-white">
            ₹{basePrice.toLocaleString()}
          </div>
        </div>

        {/* Transport Cost Input */}
        <div className="mb-4">
          <Label htmlFor="transport" className="text-gray-300 text-sm mb-2 block">
            Transport Cost (₹/quintal)
          </Label>
          <Input
            id="transport"
            type="number"
            placeholder="Enter transport cost"
            value={transportCost}
            onChange={(e) => setTransportCost(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#A3FF12]/50 focus:ring-[#A3FF12]/20"
          />
        </div>

        {/* Calculate Button */}
        <Button
          onClick={calculateProfit}
          className="w-full bg-gradient-to-r from-[#A3FF12] to-[#8FE610] text-black font-semibold hover:shadow-[0_0_20px_rgba(163,255,18,0.4)] transition-all duration-300"
        >
          Calculate Profit
        </Button>

        {/* Result */}
        {finalProfit !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-4 rounded-xl bg-gradient-to-br from-[#A3FF12]/20 to-transparent border border-[#A3FF12]/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-300 mb-1">Final Profit</div>
                <div className="text-2xl font-bold text-[#A3FF12]">
                  ₹{finalProfit.toLocaleString()}
                </div>
              </div>
              <TrendingUp className="text-[#A3FF12]" size={32} />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
