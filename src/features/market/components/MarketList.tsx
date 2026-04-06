import { motion } from "framer-motion";
import MarketPriceCard from "@/components/market/MarketPriceCard";
import { MarketSummary } from "../types";

interface MarketListProps {
  markets: MarketSummary[];
  highestPrice: number;
  lowestPrice: number;
  loading?: boolean;
}

export default function MarketList({
  markets,
  highestPrice,
  lowestPrice,
  loading = false,
}: MarketListProps) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No market data available</p>
        <p className="text-gray-500 text-sm mt-2">
          Please select a state and crop to view market prices
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-xl font-bold text-white mb-3">All Markets</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        {markets.map((market, index) => (
          <MarketPriceCard
            key={market.market}
            marketName={market.market}
            district={market.district}
            price={market.price}
            change={market.change}
            isHighest={market.price === highestPrice}
            isLowest={market.price === lowestPrice}
            index={index}
            lastUpdated={market.lastUpdated}
          />
        ))}
      </div>
    </motion.div>
  );
}
