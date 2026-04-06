import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Feature components
import CropSelector from "./components/CropSelector";
import MarketList from "./components/MarketList";
import BestWorstCard from "./components/BestWorstCard";

// Existing components (reused)
import PriceTrendChart from "@/components/market/PriceTrendChart";
import ProfitCalculator from "@/components/market/ProfitCalculator";
import DemandIndicator from "@/components/market/DemandIndicator";
import AISuggestionCard from "@/components/market/AISuggestionCard";
import ChatbotButton from "@/components/market/ChatbotButton";

// Custom hook for data management
import { useMarketData } from "./hooks/useMarketData";

export default function MarketPage() {
  const { t, lang } = useI18n();

  // Use custom hook for all data management
  const {
    states,
    selectedState,
    setSelectedState,
    availableCrops,
    selectedCrop,
    setSelectedCrop,
    marketRecords,
    priceTrend,
    cropDemand,
    marketSummary,
    priceStats,
    loadingStates,
    loadingCrops,
    loadingMarkets,
    error,
  } = useMarketData();

  const { highest, lowest, all } = marketSummary;

  // Get crop name in current language
  const getCropName = (cropName: string) => {
    const crop = availableCrops.find((c) => c.name === cropName);
    if (!crop) return cropName;
    if (lang === "hi") return crop.nameHi;
    if (lang === "te") return crop.nameTe;
    return crop.name;
  };

  // AI Suggestion
  const aiSuggestion = highest && selectedCrop
    ? {
        title: `Best time to sell ${selectedCrop}`,
        description: `Based on current market trends and demand analysis, ${highest.market} in ${highest.district} offers the best price at ₹${highest.price.toLocaleString()}/quintal. Consider selling within the next 3-5 days for maximum profit.`,
        market: `${highest.market}, ${highest.district}`,
        expectedProfit: lowest
          ? `+₹${Math.round((highest.price - lowest.price) * 0.85)}/Q`
          : "N/A",
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F0C] via-[#0F1410] to-[#0B0F0C]">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className="text-3xl font-bold text-white mb-1 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {t("marketPrices")}
          </h1>
          <p className="text-sm text-gray-400">Real-time agricultural market insights</p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-4 bg-red-500/10 border-red-500/30 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading States */}
        {loadingStates && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#A3FF12]" size={48} />
            <span className="ml-3 text-gray-400">Loading states...</span>
          </div>
        )}

        {!loadingStates && states.length > 0 && (
          <div className="grid lg:grid-cols-[280px_1fr] gap-4">
            {/* Left Sidebar - State & Crop Selection */}
            <div className="space-y-4">
              {/* State Selector */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <label className="text-xs font-semibold text-gray-400 mb-2 block uppercase tracking-wider">
                  Select State
                </label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="w-full bg-[#0B0F0C]/60 border-white/10 text-white hover:border-[#A3FF12]/30 transition-colors backdrop-blur-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0B0F0C]/95 border-white/10 backdrop-blur-xl">
                    {states.map((state) => (
                      <SelectItem
                        key={state}
                        value={state}
                        className="text-white hover:bg-[#A3FF12]/10 focus:bg-[#A3FF12]/10 focus:text-white"
                      >
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Crop Selector */}
              <CropSelector
                crops={availableCrops}
                selectedCrop={selectedCrop}
                onSelectCrop={setSelectedCrop}
                loading={loadingCrops}
              />
            </div>

            {/* Main Content Area */}
            <div className="space-y-4">

              {loadingMarkets && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-[#A3FF12]" size={48} />
                  <span className="ml-3 text-gray-400">Loading market data...</span>
                </div>
              )}

              {!loadingMarkets && selectedCrop && marketRecords.length > 0 && (
                <>
                  {/* Price Statistics */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-3 gap-3"
                  >
                    <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 backdrop-blur-xl">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl" />
                      <div className="relative z-10">
                        <div className="text-xs font-semibold text-blue-400 mb-1 uppercase tracking-wider">Min</div>
                        <div className="text-2xl font-bold text-white">₹{priceStats.min.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 backdrop-blur-xl">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />
                      <div className="relative z-10">
                        <div className="text-xs font-semibold text-purple-400 mb-1 uppercase tracking-wider">Avg</div>
                        <div className="text-2xl font-bold text-white">₹{priceStats.avg.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-[#A3FF12]/10 to-transparent border border-[#A3FF12]/20 backdrop-blur-xl">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#A3FF12]/10 rounded-full blur-2xl" />
                      <div className="relative z-10">
                        <div className="text-xs font-semibold text-[#A3FF12] mb-1 uppercase tracking-wider">Max</div>
                        <div className="text-2xl font-bold text-white">₹{priceStats.max.toLocaleString()}</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Best & Worst Markets */}
                  <div className="grid md:grid-cols-2 gap-3">
                    <BestWorstCard type="best" market={highest} />
                    <BestWorstCard type="worst" market={lowest} />
                  </div>

                  {/* Market List */}
                  <MarketList
                    markets={all}
                    highestPrice={highest?.price || 0}
                    lowestPrice={lowest?.price || 0}
                  />

                  {/* Price Trend Chart */}
                  {priceTrend.length > 0 && (
                    <PriceTrendChart
                      data={priceTrend.map((t) => ({
                        date: t.date,
                        price: t.price,
                      }))}
                      cropName={getCropName(selectedCrop)}
                      currentPrice={`₹${highest?.price.toLocaleString() || "N/A"}`}
                      change={`${highest?.change || 0 > 0 ? "+" : ""}${highest?.change || 0}%`}
                    />
                  )}

                  {/* Bottom Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Profit Calculator */}
                    {highest && <ProfitCalculator basePrice={highest.price} />}

                    {/* Demand Indicator */}
                    {cropDemand && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="relative overflow-hidden rounded-xl p-5 backdrop-blur-xl bg-gradient-to-br from-[#0B0F0C]/60 to-[#0B0F0C]/40 border border-white/10 hover:border-[#A3FF12]/20 transition-all duration-300"
                      >
                        <h3 className="font-bold text-white text-base mb-3">Market Demand</h3>
                        <DemandIndicator
                          level={cropDemand.level}
                          cropName={getCropName(selectedCrop)}
                        />
                        <p className="text-xs text-gray-400 mt-3">{cropDemand.reason}</p>
                      </motion.div>
                    )}

                    {/* AI Suggestion */}
                    {aiSuggestion && <AISuggestionCard suggestion={aiSuggestion} />}
                  </div>
                </>
              )}

              {!loadingMarkets && selectedCrop && marketRecords.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-400 text-lg">No market data available for {selectedCrop} in {selectedState}</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Try selecting a different crop or state
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {!loadingStates && states.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-400 text-lg">No data available in database</p>
            <p className="text-gray-500 text-sm mt-2">
              Please check your Supabase connection and ensure market_prices table has data
            </p>
          </div>
        )}

        {/* Chatbot Button */}
        <ChatbotButton />
      </div>
    </div>
  );
}
