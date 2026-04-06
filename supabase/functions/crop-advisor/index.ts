import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const N8N_WEBHOOK_URL =
  "https://lohithvattam.app.n8n.cloud/webhook/crop-advisor";

interface CropAdvisorRequest {
  crop: string;
  location: string;
  season: string;
  soil: string;
  water: string;
  problem: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 405,
        }
      );
    }

    // Parse request body
    const body: CropAdvisorRequest = await req.json();

    // Validate required fields
    const requiredFields = ["crop", "location", "season", "soil", "water", "problem"];
    const missingFields = requiredFields.filter((field) => !body[field as keyof CropAdvisorRequest]);

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Missing required fields: ${missingFields.join(", ")}`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log("Forwarding request to n8n webhook:", N8N_WEBHOOK_URL);
    console.log("Request payload:", body);

    // Forward request to n8n webhook
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("n8n response status:", n8nResponse.status);

    // Handle n8n errors
    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error("n8n error:", errorText);
      
      return new Response(
        JSON.stringify({
          error: "Failed to get advice from AI advisor",
          details: errorText,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: n8nResponse.status,
        }
      );
    }

    // Parse and return n8n response
    const data = await n8nResponse.json();
    console.log("n8n response data:", data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Crop advisor proxy error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
