// Custom hook for managing market data state - PRODUCTION READY
import { useState, useEffect } from "react";
import {
  getStates,
  fetchCommoditiesForState,
  fetchMarketData,
  fetchPriceTrend,
  getMarketSummary,
  fetchCropDemand,
  calculatePriceStats,
} from "../marketService";
import { CropInfo, MarketRecord, PriceTrend, CropDemand, MarketSummary } from "../types";

export function useMarketData() {
  // State management
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [availableCrops, setAvailableCrops] = useState<CropInfo[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  
  const [marketRecords, setMarketRecords] = useState<MarketRecord[]>([]);
  const [priceTrend, setPriceTrend] = useState<PriceTrend[]>([]);
  const [cropDemand, setCropDemand] = useState<CropDemand | null>(null);
  const [marketSummary, setMarketSummary] = useState<{
    highest: MarketSummary | null;
    lowest: MarketSummary | null;
    all: MarketSummary[];
  }>({ highest: null, lowest: null, all: [] });
  const [priceStats, setPriceStats] = useState<{ min: number; max: number; avg: number }>({
    min: 0,
    max: 0,
    avg: 0,
  });
  
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingCrops, setLoadingCrops] = useState(false);
  const [loadingMarkets, setLoadingMarkets] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load states on mount
  useEffect(() => {
    async function loadStates() {
      setLoadingStates(true);
      setError(null);
      
      try {
        const statesList = await getStates();
        setStates(statesList);
        
        // Auto-select first state
        if (statesList.length > 0) {
          setSelectedState(statesList[0]);
        }
      } catch (err) {
        setError("Failed to load states");
        console.error(err);
      } finally {
        setLoadingStates(false);
      }
    }

    loadStates();
  }, []);

  // Load commodities when state changes
  useEffect(() => {
    if (!selectedState) return;

    async function loadCrops() {
      setLoadingCrops(true);
      setError(null);
      setSelectedCrop(null);
      setMarketRecords([]);
      setPriceTrend([]);
      setCropDemand(null);
      setMarketSummary({ highest: null, lowest: null, all: [] });
      setPriceStats({ min: 0, max: 0, avg: 0 });
      
      try {
        const crops = await fetchCommoditiesForState(selectedState);
        setAvailableCrops(crops);
        
        // Auto-select first crop
        if (crops.length > 0) {
          setSelectedCrop(crops[0].name);
        }
      } catch (err) {
        setError("Failed to load commodities");
        console.error(err);
      } finally {
        setLoadingCrops(false);
      }
    }

    loadCrops();
  }, [selectedState]);

  // Load market data when crop changes
  useEffect(() => {
    if (!selectedState || !selectedCrop) return;

    async function loadMarketData() {
      setLoadingMarkets(true);
      setError(null);
      
      try {
        // Fetch all data in parallel
        const [markets, trend, demand] = await Promise.all([
          fetchMarketData(selectedState, selectedCrop),
          fetchPriceTrend(selectedState, selectedCrop, 15),
          fetchCropDemand(selectedState, selectedCrop),
        ]);

        // Set market records (already deduplicated in service)
        setMarketRecords(markets);
        
        // Set price trend
        setPriceTrend(trend);
        
        // Set demand
        setCropDemand(demand);
        
        // Compute market summary (best/worst)
        const summary = getMarketSummary(markets);
        setMarketSummary(summary);

        // Calculate price statistics
        const stats = calculatePriceStats(markets);
        setPriceStats(stats);
      } catch (err) {
        setError("Failed to load market data");
        console.error(err);
      } finally {
        setLoadingMarkets(false);
      }
    }

    loadMarketData();
  }, [selectedState, selectedCrop]);

  return {
    // State
    states,
    selectedState,
    setSelectedState,
    availableCrops,
    selectedCrop,
    setSelectedCrop,
    
    // Data
    marketRecords,
    priceTrend,
    cropDemand,
    marketSummary,
    priceStats,
    
    // Loading states
    loadingStates,
    loadingCrops,
    loadingMarkets,
    error,
  };
}
