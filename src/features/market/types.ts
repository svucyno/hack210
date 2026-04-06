// Market data types matching Supabase market_prices table

export interface MarketRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string; // ISO date string
  min_price: number;
  max_price: number;
  modal_price: number;
  commodity_code: number;
}

export interface CropInfo {
  name: string;
  nameHi: string;
  nameTe: string;
  category: "Cereals" | "Pulses" | "Vegetables" | "Fruits" | "Spices" | "Cash Crops" | "Oilseeds";
}

export interface MarketSummary {
  market: string;
  district: string;
  price: number;
  change: number;
  lastUpdated: string;
}

export interface PriceTrend {
  date: string;
  price: number;
}

export interface StateMarketData {
  state: string;
  availableCrops: CropInfo[];
  markets: MarketRecord[];
}

export type DemandLevel = "high" | "medium" | "low";

export interface CropDemand {
  commodity: string;
  level: DemandLevel;
  reason: string;
}
