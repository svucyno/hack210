/**
 * TypeScript interfaces for Groq-based Disease Detection
 */

// Input for disease detection
export interface DiseaseInput {
  crop?: string;                         // Crop type (e.g., "Tomato", "Rice")
  symptoms: string;                      // Description of symptoms
  location?: string;                     // Location/region
  detectedDisease?: string;              // Disease detected from image (optional)
}

// Core detection result structure
export interface DetectionResult {
  diseaseName: string;                   // Detected disease name
  confidence: number;                    // Confidence score (0-100)
  treatment: string;                     // Treatment instructions
  description?: string;                  // Disease description/causes
  symptoms?: string[];                   // List of symptoms
  pesticides?: Pesticide[];              // Recommended pesticides with links
  organicSolutions?: string[];           // Prevention tips/organic solutions
  timestamp: string;                     // ISO 8601 timestamp
}

// Pesticide information with Amazon India link
export interface Pesticide {
  name: string;                          // Pesticide product name
  buyLink: string;                       // Amazon India purchase URL
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
