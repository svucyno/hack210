/**
 * TypeScript interfaces for Plant.id Disease Detection feature
 */

// Core detection result structure
export interface DetectionResult {
  plantName?: string;                    // Identified plant species
  diseaseName: string;                   // Detected disease name
  confidence: number;                    // Confidence score (0-100)
  treatment: string;                     // Treatment instructions
  description?: string;                  // Disease description
  symptoms?: string[];                   // List of symptoms
  pesticides?: Pesticide[];              // Recommended pesticides
  organicSolutions?: string[];           // Organic treatment options
  lowConfidenceWarning?: boolean;        // Show warning if confidence < 30%
  timestamp: string;                     // ISO 8601 timestamp
}

// Pesticide information with purchase link
export interface Pesticide {
  name: string;                          // Pesticide product name
  buyLink: string;                       // Amazon India purchase URL
}

// Plant.id API request structure
export interface PlantIdRequest {
  images: string[];                      // Array of Base64 image strings
  modifiers: string[];                   // API modifiers (e.g., "health_assessment")
  plant_details: string[];               // Requested details (e.g., "common_names")
}

// Plant.id API response structure
export interface PlantIdResponse {
  suggestions: PlantSuggestion[];        // Array of plant suggestions
  health_assessment: HealthAssessment;   // Disease/health information
}

export interface PlantSuggestion {
  plant_name: string;                    // Scientific plant name
  plant_details: {
    common_names: string[];              // Common names in various languages
  };
  probability: number;                   // Confidence (0-1)
}

export interface HealthAssessment {
  is_healthy: boolean;                   // Whether plant is healthy
  diseases: Disease[];                   // Detected diseases
}

export interface Disease {
  name: string;                          // Disease name
  probability: number;                   // Confidence (0-1)
  disease_details: {
    description: string;                 // Disease description
    treatment: string;                   // Treatment information
  };
}

// PlantNet API request structure
export interface PlantNetRequest {
  images: string[];                      // Array of Base64 image strings
  organs: string[];                      // Plant organs (e.g., "leaf", "flower")
}

// PlantNet API response structure
export interface PlantNetResponse {
  results: PlantNetResult[];             // Array of identification results
}

export interface PlantNetResult {
  species: {
    scientificNameWithoutAuthor: string; // Scientific name
    commonNames: string[];               // Common names
  };
  score: number;                         // Confidence (0-1)
}

// Disease knowledge base entry
export interface DiseaseKnowledgeEntry {
  diseaseName: string;                   // Disease identifier
  symptoms: {
    en: string[];                        // English symptoms
    hi: string[];                        // Hindi symptoms
    te: string[];                        // Telugu symptoms
  };
  treatment: {
    en: string;                          // English treatment
    hi: string;                          // Hindi treatment
    te: string;                          // Telugu treatment
  };
  description: {
    en: string;                          // English description
    hi: string;                          // Hindi description
    te: string;                          // Telugu description
  };
  pesticides: Pesticide[];               // Recommended pesticides
  organicSolutions: {
    en: string[];                        // English organic solutions
    hi: string[];                        // Hindi organic solutions
    te: string[];                        // Telugu organic solutions
  };
}

// Hugging Face API types
export interface HuggingFaceRequest {
  inputs: Blob;                          // Binary image data
}

export interface HuggingFacePrediction {
  label: string;                         // Disease label
  score: number;                         // Confidence score (0-1)
}

export type HuggingFaceResponse = HuggingFacePrediction[] | {
  error?: string;                        // Error message
  estimated_time?: number;               // Estimated time for model loading
};

// Groq AI types (optional enhancement)
export interface GroqEnhancementRequest {
  diseaseLabel: string;                  // Disease label to enhance
  language: 'en' | 'hi' | 'te';         // Language for response
}

export interface GroqEnhancementResponse {
  description: string;                   // Enhanced description
  treatment: string;                     // Treatment recommendations
  symptoms: string[];                    // List of symptoms
  organicSolutions: string[];            // Organic treatment options
}

// Image validation result
export interface ValidationResult {
  isValid: boolean;                      // Whether validation passed
  error?: string;                        // Error message if validation failed
}

// Component props
export interface ImageUploadProps {
  onImageSelect: (file: File) => void;   // Callback when image selected
  disabled?: boolean;                    // Disable upload controls
  maxSizeMB?: number;                    // Maximum file size in MB
  acceptedFormats?: string[];            // Accepted MIME types
}

export interface ResultsDisplayProps {
  result: DetectionResult;               // Detection result to display
  onNewDetection: () => void;            // Callback for new detection
  onSaveResult?: () => void;             // Optional save callback
  onReadAloud?: () => void;              // Optional TTS callback
}
