import { supabase } from "@/integrations/supabase/client";

export interface GovernmentScheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  deadline: string;
  category: string;
  benefits: string;
  apply_url?: string;
  created_at: string;
}

export async function getGovernmentSchemes(
  category?: string
): Promise<GovernmentScheme[]> {
  try {
    let query = supabase
      .from("government_schemes")
      .select("*")
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (!data || data.length === 0) {
      return getMockSchemes();
    }

    return data;
  } catch (error) {
    console.error("Schemes fetch error:", error);
    return getMockSchemes();
  }
}

export async function searchSchemes(query: string): Promise<GovernmentScheme[]> {
  try {
    const { data, error } = await supabase
      .from("government_schemes")
      .select("*")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Scheme search error:", error);
    return [];
  }
}

function getMockSchemes(): GovernmentScheme[] {
  return [
    {
      id: "1",
      name: "PM-KISAN",
      description:
        "Direct income support of ₹6000/year to all farmer families",
      eligibility: "All landholding farmer families",
      deadline: "Ongoing",
      category: "Financial Support",
      benefits: "₹2000 per installment, 3 times a year",
      apply_url: "https://pmkisan.gov.in/",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Pradhan Mantri Fasal Bima Yojana",
      description: "Crop insurance scheme for farmers",
      eligibility: "All farmers growing notified crops",
      deadline: "Before sowing season",
      category: "Insurance",
      benefits: "Coverage against crop loss due to natural calamities",
      apply_url: "https://pmfby.gov.in/",
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Soil Health Card Scheme",
      description: "Free soil testing and recommendations",
      eligibility: "All farmers",
      deadline: "Ongoing",
      category: "Advisory",
      benefits: "Free soil testing and nutrient management advice",
      created_at: new Date().toISOString(),
    },
    {
      id: "4",
      name: "Kisan Credit Card",
      description: "Credit facility for farmers",
      eligibility: "Farmers with land ownership",
      deadline: "Ongoing",
      category: "Credit",
      benefits: "Low-interest loans up to ₹3 lakhs",
      apply_url: "https://www.india.gov.in/",
      created_at: new Date().toISOString(),
    },
    {
      id: "5",
      name: "PM Kusum Yojana",
      description: "Solar pump subsidy for farmers",
      eligibility: "Individual farmers and farmer groups",
      deadline: "Check state portal",
      category: "Subsidy",
      benefits: "60% subsidy on solar pumps",
      created_at: new Date().toISOString(),
    },
  ];
}
