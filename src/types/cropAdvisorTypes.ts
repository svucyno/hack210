/**
 * Request payload sent to n8n webhook
 */
export interface CropAdvisorRequest {
  /** Crop name (e.g., "Rice", "Wheat") */
  crop: string;
  /** Location/region (e.g., "Andhra Pradesh") */
  location: string;
  /** Growing season (e.g., "Kharif", "Rabi") */
  season: string;
  /** Soil type (e.g., "Clay", "Sandy") */
  soil: string;
  /** Water availability (e.g., "Irrigated", "Rainfed") */
  water: string;
  /** Problem description (e.g., "Yellowing leaves") */
  problem: string;
}

/**
 * Response from n8n webhook
 */
export interface N8nWebhookResponse {
  /** AI-generated advice text */
  output: string;
}

/**
 * Processed advisor response for display
 */
export interface AdvisorResponse {
  /** Raw output from API */
  output: string;
  /** ISO 8601 timestamp */
  timestamp: string;
}

/**
 * Validation result for form fields
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Service configuration
 */
export interface CropAdvisorServiceConfig {
  apiUrl: string;
  timeout: number;
}
