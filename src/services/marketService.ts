// Market Service - NO MOCK DATA, Production Ready
import { supabase } from "@/integrations/supabase/client";

// Interface matching your actual database schema
export interface MarketPrice {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  commodity_code: number;
}

// Fetch market prices with filters (NO MOCK DATA)
export async function getMarketPrices(
  state?: string,
  commodity?: string
): Promise<MarketPrice[]> {
  try {
    let query = supabase
      .from("market_prices" as any)
      .select("*")
      .order("arrival_date", { ascending: false });

    if (state) {
      query = query.eq("state", state);
    }

    if (commodity) {
      query = query.eq("commodity", commodity);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Market prices fetch error:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn("No market data found for filters:", { state, commodity });
      return [];
    }

    return (data as any) as MarketPrice[];
  } catch (error) {
    console.error("Market prices fetch error:", error);
    return [];
  }
}

// Get unique states from database
export async function getStates(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("market_prices" as any)
      .select("state")
      .order("state");

    if (error) throw error;

    const uniqueStates = [...new Set(data.map((row: any) => row.state))];
    return uniqueStates;
  } catch (error) {
    console.error("Error fetching states:", error);
    return [];
  }
}

// Get unique commodities for a state
export async function getCommoditiesForState(state: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("market_prices" as any)
      .select("commodity")
      .eq("state", state)
      .order("commodity");

    if (error) throw error;

    const uniqueCommodities = [...new Set(data.map((row: any) => row.commodity))];
    return uniqueCommodities;
  } catch (error) {
    console.error("Error fetching commodities:", error);
    return [];
  }
}

// Get crop price trend (real data only)
export async function getCropTrend(
  state: string,
  commodity: string,
  days: number = 15
): Promise<{ date: string; price: number }[]> {
  try {
    // Get distinct dates first
    const { data: dateData, error: dateError } = await supabase
      .from("market_prices" as any)
      .select("arrival_date")
      .eq("state", state)
      .eq("commodity", commodity)
      .order("arrival_date", { ascending: false })
      .limit(days);

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
    const trends = Array.from(trendMap.entries()).map(([date, prices]) => ({
      date,
      price: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    }));

    // Sort by date ASC
    return trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error("Crop trend fetch error:", error);
    return [];
  }
}

// Get latest market data with deduplication
export async function getLatestMarketData(
  state: string,
  commodity: string
): Promise<MarketPrice[]> {
  try {
    // Fetch ALL records for state + commodity
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

    return Array.from(latestByMarket.values()) as MarketPrice[];
  } catch (error) {
    console.error("Error fetching latest market data:", error);
    return [];
  }
}

// Calculate price statistics
export function calculatePriceStats(records: MarketPrice[]): {
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

// Get best and worst markets
export function getBestWorstMarkets(records: MarketPrice[]): {
  best: MarketPrice | null;
  worst: MarketPrice | null;
} {
  if (records.length === 0) {
    return { best: null, worst: null };
  }

  // Sort by modal_price DESC
  const sorted = [...records].sort((a, b) => b.modal_price - a.modal_price);

  return {
    best: sorted[0],  // MAX modal_price
    worst: sorted[sorted.length - 1],  // MIN modal_price
  };
}
