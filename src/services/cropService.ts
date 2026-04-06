export interface CropRecommendation {
  crop: string;
  suitability: number;
  tips: string[];
  expectedYield: string;
  season: string;
  waterRequirement: string;
  profitPotential: "high" | "medium" | "low";
}

export type SoilType = "black" | "red" | "alluvial" | "clay" | "sandy" | "loamy";
export type Season = "kharif" | "rabi" | "zaid" | "summer";
export type WaterAvailability = "high" | "medium" | "low";

const cropDatabase: Record<string, {
  soils: SoilType[];
  seasons: Season[];
  water: WaterAvailability[];
  yield: string;
  tips: string[];
  profit: "high" | "medium" | "low";
}> = {
  Cotton: {
    soils: ["black", "alluvial"],
    seasons: ["kharif"],
    water: ["medium", "high"],
    yield: "15-20 quintals/acre",
    tips: [
      "Ensure proper drainage",
      "Apply fertilizers in split doses",
      "Monitor for bollworm pests",
    ],
    profit: "high",
  },
  Rice: {
    soils: ["alluvial", "clay", "loamy"],
    seasons: ["kharif"],
    water: ["high"],
    yield: "25-30 quintals/acre",
    tips: [
      "Maintain 2-3 inches water level",
      "Use disease-resistant varieties",
      "Apply zinc sulfate if needed",
    ],
    profit: "medium",
  },
  Wheat: {
    soils: ["alluvial", "loamy", "clay"],
    seasons: ["rabi"],
    water: ["medium"],
    yield: "20-25 quintals/acre",
    tips: [
      "Sow at right time (Nov-Dec)",
      "Use certified seeds",
      "Apply nitrogen in 3 splits",
    ],
    profit: "medium",
  },
  Tomato: {
    soils: ["loamy", "sandy", "red"],
    seasons: ["rabi", "summer"],
    water: ["medium", "high"],
    yield: "200-250 quintals/acre",
    tips: [
      "Use drip irrigation",
      "Stake plants for support",
      "Control whitefly and leaf curl",
    ],
    profit: "high",
  },
  Onion: {
    soils: ["loamy", "alluvial"],
    seasons: ["rabi", "kharif"],
    water: ["medium"],
    yield: "100-150 quintals/acre",
    tips: [
      "Ensure good drainage",
      "Apply potash for better bulbs",
      "Harvest when tops fall over",
    ],
    profit: "high",
  },
  Sugarcane: {
    soils: ["loamy", "alluvial", "black"],
    seasons: ["kharif", "rabi"],
    water: ["high"],
    yield: "300-400 quintals/acre",
    tips: [
      "Plant disease-free setts",
      "Irrigate at critical stages",
      "Apply organic manure",
    ],
    profit: "medium",
  },
  Groundnut: {
    soils: ["sandy", "loamy", "red"],
    seasons: ["kharif", "rabi"],
    water: ["low", "medium"],
    yield: "10-15 quintals/acre",
    tips: [
      "Ensure calcium availability",
      "Control leaf miner",
      "Harvest at right maturity",
    ],
    profit: "medium",
  },
  Maize: {
    soils: ["loamy", "alluvial", "red"],
    seasons: ["kharif", "rabi"],
    water: ["medium"],
    yield: "20-25 quintals/acre",
    tips: [
      "Use hybrid varieties",
      "Control stem borer",
      "Apply nitrogen at knee-high stage",
    ],
    profit: "medium",
  },
};

export function getCropRecommendation(
  soil: SoilType,
  season: Season,
  water: WaterAvailability
): CropRecommendation[] {
  const recommendations: CropRecommendation[] = [];

  for (const [cropName, cropData] of Object.entries(cropDatabase)) {
    let suitability = 0;

    // Soil match (40% weight)
    if (cropData.soils.includes(soil)) {
      suitability += 40;
    }

    // Season match (40% weight)
    if (cropData.seasons.includes(season)) {
      suitability += 40;
    }

    // Water match (20% weight)
    if (cropData.water.includes(water)) {
      suitability += 20;
    }

    if (suitability >= 60) {
      recommendations.push({
        crop: cropName,
        suitability,
        tips: cropData.tips,
        expectedYield: cropData.yield,
        season: season,
        waterRequirement: water,
        profitPotential: cropData.profit,
      });
    }
  }

  // Sort by suitability
  return recommendations.sort((a, b) => b.suitability - a.suitability);
}

export function getSeasonalCrops(season: Season): string[] {
  return Object.entries(cropDatabase)
    .filter(([_, data]) => data.seasons.includes(season))
    .map(([name]) => name);
}

export function getCropDetails(cropName: string) {
  return cropDatabase[cropName] || null;
}
