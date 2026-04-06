import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp } from "lucide-react";

interface PriceTrendChartProps {
  data: Array<{ date: string; price: number }>;
  cropName: string;
  currentPrice: string;
  change: string;
}

export default function PriceTrendChart({
  data,
  cropName,
  currentPrice,
  change,
}: PriceTrendChartProps) {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative overflow-hidden rounded-xl p-5 backdrop-blur-xl bg-gradient-to-br from-[#0B0F0C]/60 to-[#0B0F0C]/40 border border-white/10 hover:border-[#A3FF12]/20 transition-all duration-300"
    >
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#A3FF12]/5 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base mb-0.5">Price Trend</h3>
            <p className="text-xs text-gray-400">{cropName} - Last {data.length} days</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-white mb-0.5">{currentPrice}</div>
            <div className="flex items-center gap-1 text-[#A3FF12] text-xs font-semibold">
              <TrendingUp size={12} />
              {change}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A3FF12" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#A3FF12" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: "#6B7280", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#374151", strokeWidth: 1 }}
                tickFormatter={formatDate}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "#6B7280", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#374151", strokeWidth: 1 }}
                tickFormatter={(value) => `₹${value}`}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(11, 15, 12, 0.95)",
                  border: "1px solid rgba(163, 255, 18, 0.2)",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "#fff",
                  backdropFilter: "blur(10px)",
                  padding: "8px 12px",
                }}
                formatter={(value: number) => [`₹${Math.round(value)}`, "Price"]}
                labelFormatter={(label) => formatDate(label)}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#A3FF12"
                strokeWidth={2.5}
                fill="url(#priceGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#A3FF12",
                  stroke: "#0B0F0C",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 mb-0.5">Min</div>
            <div className="text-base font-bold text-white">
              ₹{Math.min(...data.map((d) => d.price)).toFixed(0)}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 mb-0.5">Avg</div>
            <div className="text-base font-bold text-white">
              ₹{(data.reduce((sum, d) => sum + d.price, 0) / data.length).toFixed(0)}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-gray-400 mb-0.5">Max</div>
            <div className="text-base font-bold text-white">
              ₹{Math.max(...data.map((d) => d.price)).toFixed(0)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
