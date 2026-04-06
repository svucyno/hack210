// Real Supabase market data service - PRODUCTION READY
import { supabase } from "@/integrations/supabase/client";
import {
  MarketRecord,
  CropInfo,
  MarketSummary,
  PriceTrend,
  CropDemand,
} from "./types";

// Fetch available states from database
export async function fetchStates(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("market_prices" as any)
      .select("state")
      .order("state");

    if (error) throw error;

    // Get unique states
    const uniqueStates = [...new Set(data.map((row: any) => row.state))];
    return uniqueStates;
  } catch (error) {
    console.error("Error fetching states:", error);
    return [];
  }
}

// Fetch available commodities for a state
export async function fetchCommoditiesForState(state: string): Promise<CropInfo[]> {
  try {
    const { data, error } = await supabase
      .from("market_prices" as any)
      .select("commodity")
      .eq("state", state)
      .order("commodity");

    if (error) throw error;

    // Get unique commodities
    const uniqueCommodities = [...new Set(data.map((row: any) => row.commodity))];

    // Convert to CropInfo format
    const crops: CropInfo[] = uniqueCommodities.map((commodity) => ({
      name: commodity,
      nameHi: commodity,
      nameTe: commodity,
      category: categorizeCrop(commodity),
    }));

    return crops;
  } catch (error) {
    console.error("Error fetching commodities:", error);
    return [];
  }
}

// Categorize crop based on name
function categorizeCrop(commodity: string): CropInfo["category"] {
  const lower = commodity.toLowerCase();
  
  if (["rice", "paddy", "wheat", "maize", "jowar", "bajra"].some(c => lower.includes(c))) {
    return "Cereals";
  }
  if (["cotton", "sugarcane", "tobacco", "jute"].some(c => lower.includes(c))) {
    return "Cash Crops";
  }
  if (["tomato", "onion", "potato", "brinjal", "cabbage", "cauliflower", "carrot", "beans"].some(c => lower.includes(c))) {
    return "Vegetables";
  }
  if (["mango", "apple", "banana", "papaya", "guava", "orange", "grapes"].some(c => lower.includes(c))) {
    return "Fruits";
  }
  if (["chilli", "chili", "turmeric", "coriander", "cumin", "pepper"].some(c => lower.includes(c))) {
    return "Spices";
  }
  if (["groundnut", "sunflower", "sesame", "castor", "mustard", "soybean"].some(c => lower.includes(c))) {
    return "Oilseeds";
  }
  if (["red gram", "green gram", "black gram", "bengal gram", "arhar", "moong", "urad", "chana"].some(c => lower.includes(c))) {
    return "Pulses";
  }
  
  return "Cash Crops"; // Default
}

// Fetch market data with deduplication (CRITICAL FIX)
export async function fetchMarketData(
  state: string,
  commodity: string
): Promise<MarketRecord[]> {
  try {
    // Fetch ALL records for state + commodity, ordered by date DESC
    const { data, error } = await supabase
      .from("market_prices" as any)
      .select("*")
      .eq("state", state)
      .eq("commodity", commodity)
      .order("arrival_date", { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // DEDUPLICATION: Keep only latest record per market
    const latestByMarket = new Map<string, any>();
    
    data.forEach((record: any) => {
      const marketKey = record.market;
      const existing = latestByMarket.get(marketKey);
      
      // Keep record with latest arrival_date
      if (!existing || new Date(record.arrival_date) > new Date(existing.arrival_date)) {
        latestByMarket.set(marketKey, record);
      }
    });

    // Convert to array and return
    return Array.from(latestByMarket.values()) as MarketRecord[];
  } catch (error) {
    console.error("Error fetching market data:", error);
    return [];
  }
}

// Fetch price trend (last 10-15 records)
export async function fetchPriceTrend(
  state: string,
  commodity: string,
  limit: number = 15
): Promise<PriceTrend[]> {
  try {
    // Get distinct dates first
    const { data: dateData, error: dateError } = await supabase
      .from("market_prices" as any)
      .select("arrival_date")
      .eq("state", state)
      .eq("commodity", commodity)
      .order("arrival_date", { ascending: false })
      .limit(limit);

    if (dateError) throw dateError;
    if (!dateData || dateData.length === 0) return [];

    // Get unique dates
    const uniqueDates = [...new Set(dateData.map((d: any) => d.arrival_date))];

    // Fetch data for these dates
    const { data, error } = await supabase
      .from("market_prices" as any)
      .select("arrival_date, modal_price")
      .eq("state", state)
      .eq("commodity", commodity)
      .in("arrival_date", uniqueDates)
      .order("arrival_date", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Group by date and calculate average
    const trendMap = new Map<string, number[]>();
    data.forEach((record: any) => {
      const date = record.arrival_date;
      if (!trendMap.has(date)) {
        trendMap.set(date, []);
      }
      trendMap.get(date)!.push(record.modal_price);
    });

    // Calculate average for each date
    const trends: PriceTrend[] = Array.from(trendMap.entries()).map(([date, prices]) => ({
      date,
      price: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    }));

    // Sort by date ASC
    return trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error("Error fetching price trend:", error);
    return [];
  }
}

// Get market summary with CORRECT best/worst logic
export function getMarketSummary(records: MarketRecord[]): {
  highest: MarketSummary | null;
  lowest: MarketSummary | null;
  all: MarketSummary[];
} {
  if (records.length === 0) {
    return { highest: null, lowest: null, all: [] };
  }

  // Convert to summaries
  const summaries: MarketSummary[] = records.map((record) => ({
    market: record.market,
    district: record.district,
    price: record.modal_price,
    change: 0, // Can be calculated from historical data if needed
    lastUpdated: record.arrival_date,
  }));

  // Sort by price DESC
  const sortedByPrice = [...summaries].sort((a, b) => b.price - a.price);

  // BEST PRICE = MAX modal_price (first in sorted array)
  const highest = sortedByPrice[0];

  // LOWEST PRICE = MIN modal_price (last in sorted array)
  const lowest = sortedByPrice[sortedByPrice.length - 1];

  return { highest, lowest, all: summaries };
}

// Calculate price statistics
export function calculatePriceStats(records: MarketRecord[]): {
  min: number;
  max: number;
  avg: number;
} {
  if (records.length === 0) {
    return { min: 0, max: 0, avg: 0 };
  }

  const prices = records.map((r) => r.modal_price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  return { min, max, avg };
}

// Get crop demand based on price trend
export async function fetchCropDemand(
  state: string,
  commodity: string
): Promise<CropDemand> {
  try {
    // Get last 7 days of data
    const trends = await fetchPriceTrend(state, commodity, 7);
    
    if (trends.length < 2) {
      return {
        commodity,
        level: "medium",
        reason: "Insufficient data for demand analysis",
      };
    }

    // Calculate price trend
    const firstPrice = trends[0].price;
    const lastPrice = trends[trends.length - 1].price;
    const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;

    // Determine demand level
    let level: CropDemand["level"];
    let reason: string;

    if (priceChange > 5) {
      level = "high";
      reason = `Prices increased by ${priceChange.toFixed(1)}% - High demand`;
    } else if (priceChange < -5) {
      level = "low";
      reason = `Prices decreased by ${Math.abs(priceChange).toFixed(1)}% - Surplus supply`;
    } else {
      level = "medium";
      reason = "Stable prices - Moderate demand";
    }

    return { commodity, level, reason };
  } catch (error) {
    console.error("Error fetching crop demand:", error);
    return {
      commodity,
      level: "medium",
      reason: "Unable to calculate demand",
    };
  }
}

// Get all states (wrapper)
export async function getStates(): Promise<string[]> {
  return fetchStates();
}
