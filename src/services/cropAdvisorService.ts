import type {
  CropAdvisorRequest,
  N8nWebhookResponse,
  AdvisorResponse,
} from "@/types/cropAdvisorTypes";

const DEFAULT_API_URL =
  "https://lohithvattam.app.n8n.cloud/webhook/crop-advisor";
const TIMEOUT_MS = 30000; // 30 seconds
const MAX_RETRIES = 2; // Retry failed requests up to 2 times
const RETRY_DELAY_MS = 1000; // Wait 1 second between retries

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get crop advice from n8n AI advisor with retry logic
 */
export async function getCropAdvice(
  request: CropAdvisorRequest,
  retryCount = 0
): Promise<AdvisorResponse> {
  const apiUrl = import.meta.env.VITE_N8N_CROP_ADVISOR_URL || DEFAULT_API_URL;

  // Log warning if using default URL in production
  if (!import.meta.env.VITE_N8N_CROP_ADVISOR_URL && import.meta.env.PROD) {
    console.warn(
      "Using default n8n webhook URL. Set VITE_N8N_CROP_ADVISOR_URL in environment variables."
    );
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    console.log("=".repeat(50));
    console.log("🚀 CROP ADVISOR API CALL");
    console.log("=".repeat(50));
    console.log(`Attempt: ${retryCount + 1}/${MAX_RETRIES + 1}`);
    console.log(`URL: ${apiUrl}`);
    console.log(`METHOD: POST ✓`);  // ✅ Explicitly showing POST method
    console.log("Request payload:", request);
    console.log("=".repeat(50));

    const response = await fetch(apiUrl, {
      method: "POST",  // ✅ CONFIRMED: Using POST, NOT GET
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("API error response:", errorText);

      if (response.status >= 400 && response.status < 500) {
        // Client errors (4xx) - don't retry
        if (response.status === 400) {
          throw new Error(
            "Invalid request. Please check your inputs and try again."
          );
        } else if (response.status === 401 || response.status === 403) {
          throw new Error("Authentication error. Please contact support.");
        } else if (response.status === 404) {
          throw new Error("Service not found. Please contact support.");
        } else {
          throw new Error(
            "Invalid request. Please check your inputs and try again."
          );
        }
      } else if (response.status >= 500) {
        // Server errors (5xx) - retry if possible
        if (retryCount < MAX_RETRIES) {
          console.log(`Server error, retrying in ${RETRY_DELAY_MS}ms...`);
          await sleep(RETRY_DELAY_MS);
          return getCropAdvice(request, retryCount + 1);
        }
        throw new Error(
          "Service temporarily unavailable. Please try again later."
        );
      }
    }

    // Parse response
    const data: N8nWebhookResponse = await response.json();
    console.log("Response data:", data);

    // Validate response has output field
    if (!data.output) {
      console.error("Invalid response format:", data);
      
      // If response has error field, throw it
      if ('error' in data && typeof data.error === 'string') {
        throw new Error(data.error);
      }
      
      throw new Error("Received invalid response. Please try again.");
    }

    // Return processed response
    return {
      output: data.output,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    clearTimeout(timeoutId);

    console.error("Crop advisor API error:", error);
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);

    // Handle timeout
    if (error instanceof Error && error.name === "AbortError") {
      // Retry on timeout if retries available
      if (retryCount < MAX_RETRIES) {
        console.log(`Request timeout, retrying in ${RETRY_DELAY_MS}ms...`);
        await sleep(RETRY_DELAY_MS);
        return getCropAdvice(request, retryCount + 1);
      }
      throw new Error(
        "Request timeout. Please check your connection and try again."
      );
    }

    // Handle network errors (including CORS)
    if (error instanceof TypeError) {
      console.error("Network/CORS error detected.");
      console.error("This usually means:");
      console.error("1. The n8n webhook doesn't have CORS headers configured");
      console.error("2. The webhook URL is incorrect");
      console.error("3. There's a network connectivity issue");
      
      // Retry network errors if retries available
      if (retryCount < MAX_RETRIES) {
        console.log(`Network error, retrying in ${RETRY_DELAY_MS}ms...`);
        await sleep(RETRY_DELAY_MS);
        return getCropAdvice(request, retryCount + 1);
      }
      
      throw new Error(
        "Unable to connect to the service. Please check your internet connection or contact support."
      );
    }

    // Re-throw other errors (already formatted)
    throw error;
  }
}
