import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DiseaseDetectRequest {
  image: string; // Base64 encoded image
}

interface HuggingFaceResponse {
  label: string;
  score: number;
}

interface DetectionResult {
  diseaseName: string;
  confidence: number; // 0-100
  treatment: string;
  lowConfidenceWarning?: boolean;
  timestamp: string;
}

interface DiseaseDetectResponse {
  success: boolean;
  result?: DetectionResult;
  error?: string;
}

// Helper function to format disease name
function formatDiseaseName(label: string): string {
  // Remove underscores and convert to proper case
  // Example: "Tomato___Late_blight" -> "Tomato Late Blight"
  return label
    .replace(/___/g, " - ")
    .replace(/_/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Helper function to get treatment suggestion
function getTreatmentSuggestion(label: string): string {
  // Basic treatment mapping - can be expanded
  const treatmentMap: Record<string, string> = {
    "late_blight": "Remove infected leaves immediately. Apply copper-based fungicide. Ensure good air circulation. Avoid overhead watering.",
    "early_blight": "Remove infected leaves. Apply fungicide containing chlorothalonil. Practice crop rotation. Mulch around plants.",
    "leaf_mold": "Improve air circulation. Reduce humidity. Apply fungicide. Remove infected leaves.",
    "septoria_leaf_spot": "Remove infected leaves. Apply fungicide. Avoid overhead watering. Practice crop rotation.",
    "bacterial_spot": "Remove infected plants. Apply copper-based bactericide. Avoid overhead watering. Use disease-free seeds.",
    "yellow_leaf_curl_virus": "Remove infected plants. Control whitefly population. Use resistant varieties. Remove weeds.",
    "mosaic_virus": "Remove infected plants. Control aphid population. Use resistant varieties. Disinfect tools.",
    "healthy": "Your plant appears healthy! Continue regular care: adequate watering, proper fertilization, and monitoring for any changes.",
  };

  // Try to match disease type from label
  const lowerLabel = label.toLowerCase();
  
  for (const [key, treatment] of Object.entries(treatmentMap)) {
    if (lowerLabel.includes(key)) {
      return treatment;
    }
  }

  // Default treatment advice
  return "Consult with a local agricultural expert for specific treatment recommendations. Remove affected leaves and monitor plant health closely.";
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image }: DiseaseDetectRequest = await req.json();

    if (!image || typeof image !== "string") {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Image is required and must be a Base64 string" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate Base64 format
    if (!image.startsWith("data:image/")) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Invalid image format. Please provide a Base64 encoded image." 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get Hugging Face API key from environment
    const huggingFaceKey = Deno.env.get("HUGGINGFACE_API_KEY");
    
    if (!huggingFaceKey) {
      throw new Error("HUGGINGFACE_API_KEY not configured");
    }

    // Call Hugging Face API
    const modelUrl = "https://api-inference.huggingface.co/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification";
    
    const huggingFaceResponse = await fetch(modelUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${huggingFaceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: image
      })
    });

    if (!huggingFaceResponse.ok) {
      const errorText = await huggingFaceResponse.text();
      console.error("Hugging Face API error:", errorText);
      throw new Error("AI service temporarily unavailable. Please try again later.");
    }

    const predictions: HuggingFaceResponse[] = await huggingFaceResponse.json();

    if (!predictions || predictions.length === 0) {
      throw new Error("No predictions returned from AI model");
    }

    // Extract highest confidence prediction
    const topPrediction = predictions[0];
    const confidence = Math.round(topPrediction.score * 100);
    
    // Format disease name (remove underscores, proper capitalization)
    const diseaseName = formatDiseaseName(topPrediction.label);
    
    // Get treatment suggestion
    const treatment = getTreatmentSuggestion(topPrediction.label);
    
    // Build result
    const result: DetectionResult = {
      diseaseName,
      confidence,
      treatment,
      lowConfidenceWarning: confidence < 50,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify({ 
        success: true,
        result
      }),
      { 
        status: 200,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );

  } catch (error) {
    console.error("Disease detection error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Failed to process disease detection. Please try again.",
        details: error.message
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
