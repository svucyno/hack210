/**
 * Disease Detection Service using Hugging Face Inference API
 * Provides plant disease identification with treatment recommendations
 */

import type {
  DetectionResult,
  ValidationResult,
  DiseaseKnowledgeEntry
} from '../types/diseaseTypes';
import diseaseDatabase from '../data/diseaseDatabase.json';

// Constants
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const COMPRESSION_THRESHOLD_MB = 1;
const COMPRESSION_THRESHOLD_BYTES = COMPRESSION_THRESHOLD_MB * 1024 * 1024;
const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
const API_TIMEOUT_MS = 30000;
const LOW_CONFIDENCE_THRESHOLD = 30;

/**
 * Validates environment configuration for Hugging Face API
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateEnvironmentConfig(): ValidationResult {
  const apiToken = import.meta.env.VITE_HUGGINGFACE_API_TOKEN;
  
  if (!apiToken) {
    return {
      isValid: false,
      error: 'Hugging Face API token not configured. Please set VITE_HUGGINGFACE_API_TOKEN in environment variables.'
    };
  }
  
  // Optional: Validate token format (should start with 'hf_')
  if (!apiToken.startsWith('hf_')) {
    return {
      isValid: false,
      error: 'Invalid Hugging Face API token format. Token should start with "hf_".'
    };
  }
  
  return { isValid: true };
}

// Error Types
enum ErrorType {
  MISSING_API_KEY = 'MISSING_API_KEY',
  INVALID_API_KEY = 'INVALID_API_KEY',
  RATE_LIMIT = 'RATE_LIMIT',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CORS_ERROR = 'CORS_ERROR'
}

// Error Context Interface
interface ErrorContext {
  type: ErrorType;
  message: string;
  originalError: Error;
  statusCode?: number;
  apiName: string;
}

/**
 * Classifies error type based on HTTP status code and error message
 * @param error - Error object
 * @param statusCode - HTTP status code (optional)
 * @returns ErrorType enum value
 */
function classifyError(error: Error, statusCode?: number): ErrorType {
  // Check for timeout/abort errors
  if (error.name === 'AbortError' || error.message.toLowerCase().includes('timeout')) {
    return ErrorType.TIMEOUT;
  }

  // Check for CORS errors
  if (error.message.toLowerCase().includes('cors') || 
      error.message.toLowerCase().includes('cross-origin')) {
    return ErrorType.CORS_ERROR;
  }

  // Check for network errors
  if (error.message.toLowerCase().includes('network') || 
      error.message.toLowerCase().includes('failed to fetch')) {
    return ErrorType.NETWORK_ERROR;
  }

  // Classify based on HTTP status code
  if (statusCode) {
    if (statusCode === 401 || statusCode === 403) {
      return ErrorType.INVALID_API_KEY;
    } else if (statusCode === 429) {
      return ErrorType.RATE_LIMIT;
    } else if (statusCode >= 500) {
      return ErrorType.SERVER_ERROR;
    }
  }

  // Check error message for API key issues
  if (error.message.toLowerCase().includes('api key not configured') ||
      error.message.toLowerCase().includes('api key not set')) {
    return ErrorType.MISSING_API_KEY;
  }

  // Default to network error
  return ErrorType.NETWORK_ERROR;
}

/**
 * Builds specific error message based on error contexts from both APIs
 * @param plantIdError - Error context from Plant.id API
 * @param plantNetError - Error context from PlantNet API (optional)
 * @returns Specific, actionable error message
 */
function buildErrorMessage(plantIdError: ErrorContext, plantNetError?: ErrorContext): string {
  console.error('[diseaseService] Building error message:', {
    plantIdError: {
      type: plantIdError.type,
      statusCode: plantIdError.statusCode,
      message: plantIdError.message
    },
    plantNetError: plantNetError ? {
      type: plantNetError.type,
      statusCode: plantNetError.statusCode,
      message: plantNetError.message
    } : 'No PlantNet error'
  });

  // Case 1: Plant.id authentication error + PlantNet not configured
  if ((plantIdError.type === ErrorType.INVALID_API_KEY || plantIdError.type === ErrorType.MISSING_API_KEY) && 
      !plantNetError) {
    return 'Plant.id API key is invalid or missing. PlantNet fallback is not configured. Please check your API keys in .env file.';
  }

  // Case 2: Plant.id timeout/unavailable + PlantNet not configured
  if ((plantIdError.type === ErrorType.TIMEOUT || plantIdError.type === ErrorType.SERVER_ERROR) && 
      !plantNetError) {
    const reason = plantIdError.type === ErrorType.TIMEOUT ? 'Request timeout' : 'Service temporarily unavailable';
    return `Plant.id service unavailable: ${reason}. PlantNet fallback is not configured. Please set VITE_PLANTNET_API_KEY or try again later.`;
  }

  // Case 3: Both APIs fail with authentication errors
  if (plantNetError && 
      (plantIdError.type === ErrorType.INVALID_API_KEY || plantIdError.type === ErrorType.MISSING_API_KEY) &&
      (plantNetError.type === ErrorType.INVALID_API_KEY || plantNetError.type === ErrorType.MISSING_API_KEY)) {
    return 'Both Plant.id and PlantNet APIs failed. Authentication failed. Please check your API keys in .env file.';
  }

  // Case 4: Both APIs timeout (actual network issue)
  if (plantNetError && 
      plantIdError.type === ErrorType.TIMEOUT && 
      plantNetError.type === ErrorType.TIMEOUT) {
    return 'Unable to connect to plant identification services. Please check your internet connection and try again.';
  }

  // Case 5: Plant.id rate limit
  if (plantIdError.type === ErrorType.RATE_LIMIT && !plantNetError) {
    return 'Plant.id rate limit exceeded. Please wait a moment and try again.';
  }

  // Case 6: CORS error
  if (plantIdError.type === ErrorType.CORS_ERROR) {
    return 'CORS configuration error. Please check API endpoint settings.';
  }

  // Case 7: Generic fallback with both errors
  if (plantNetError) {
    return `Both Plant.id and PlantNet APIs failed. Plant.id: ${plantIdError.message}. PlantNet: ${plantNetError.message}. Please check your configuration.`;
  }

  // Case 8: Single API error fallback
  return plantIdError.message;
}

/**
 * Validates image file format and size
 * @param file - File to validate
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateImageFormat(file: File): ValidationResult {
  // Check if file exists
  if (!file) {
    return {
      isValid: false,
      error: 'No file selected. Please choose an image file.'
    };
  }

  // Check file type
  if (!ACCEPTED_FORMATS.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Please upload JPEG, PNG, or WebP images only.`
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please choose a smaller image.`
    };
  }

  return { isValid: true };
}

/**
 * Converts image file to Blob format required by Hugging Face API
 * @param file - Image file to convert
 * @returns Promise resolving to Blob
 */
export async function convertToBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: file.type });
      console.log(`[diseaseService] Image converted to Blob, size: ${(blob.size / 1024).toFixed(2)}KB`);
      resolve(blob);
    };
    
    reader.onerror = () => {
      console.error('[diseaseService] Error converting image to Blob:', reader.error);
      reject(new Error('Failed to convert image to Blob'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Converts image file to Base64 data URL
 * @param file - Image file to convert
 * @returns Promise resolving to Base64 data URL string
 */
export async function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      console.log(`[diseaseService] Image converted to Base64, size: ${(result.length / 1024).toFixed(2)}KB`);
      resolve(result);
    };
    
    reader.onerror = () => {
      console.error('[diseaseService] Error converting image to Base64:', reader.error);
      reject(new Error('Failed to convert image to Base64'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses image if it exceeds the compression threshold
 * @param file - Image file to compress
 * @param maxSizeMB - Maximum size in MB (default: 1MB)
 * @returns Promise resolving to compressed Blob
 */
export async function compressImage(file: File, maxSizeMB: number = COMPRESSION_THRESHOLD_MB): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions to reduce file size
        const maxDimension = 1024;
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress with quality adjustment and convert to Blob
        const quality = 0.7;
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            console.log(`[diseaseService] Image compressed from ${(file.size / 1024).toFixed(2)}KB to ${(blob.size / 1024).toFixed(2)}KB`);
            resolve(blob);
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Formats disease label from API format to human-readable format
 * @param label - Disease label from API (e.g., "tomato_early_blight")
 * @returns Formatted label (e.g., "Tomato Early Blight")
 */
export function formatDiseaseLabel(label: string): string {
  if (!label || label.trim() === '') {
    return 'Unknown Disease';
  }
  
  // Replace underscores with spaces
  const withSpaces = label.replace(/_/g, ' ');
  
  // Capitalize first letter of each word
  const capitalized = withSpaces
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
  
  return capitalized;
}

/**
 * Extracts the prediction with highest confidence from Hugging Face API response
 * @param response - Hugging Face API response
 * @returns Top prediction with label and score
 */
export function extractTopPrediction(response: import('../types/diseaseTypes').HuggingFaceResponse): { label: string; score: number } {
  // Handle error response
  if (!Array.isArray(response)) {
    if (response.error) {
      throw new Error(response.error);
    }
    throw new Error('Invalid response format from Hugging Face API');
  }
  
  // Handle empty array
  if (response.length === 0) {
    throw new Error('No predictions returned from Hugging Face API');
  }
  
  // Find prediction with highest score
  const topPrediction = response.reduce((max, current) => 
    current.score > max.score ? current : max
  );
  
  console.log(`[diseaseService] Top prediction: ${topPrediction.label} (${(topPrediction.score * 100).toFixed(1)}%)`);
  
  return topPrediction;
}

/**
 * Calls Hugging Face Inference API for disease classification
 * @param imageBlob - Image as Blob
 * @param maxRetries - Maximum number of retries for model loading (default: 3)
 * @param retryDelay - Delay between retries in milliseconds (default: 5000)
 * @returns Promise resolving to Hugging Face API response
 */
export async function callHuggingFaceAPI(
  imageBlob: Blob,
  maxRetries: number = 3,
  retryDelay: number = 5000
): Promise<import('../types/diseaseTypes').HuggingFaceResponse> {
  const apiToken = import.meta.env.VITE_HUGGINGFACE_API_TOKEN;
  const modelId = import.meta.env.VITE_HUGGINGFACE_MODEL_ID || 
    'linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification';
  
  if (!apiToken) {
    throw new Error('Hugging Face API token not configured. Please set VITE_HUGGINGFACE_API_TOKEN in environment variables.');
  }
  
  const apiUrl = `https://api-inference.huggingface.co/models/${modelId}`;
  
  console.log(`[diseaseService] Calling Hugging Face API at ${apiUrl}`);
  console.log(`[diseaseService] Image size: ${(imageBlob.size / 1024).toFixed(2)}KB`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/octet-stream'
        },
        body: imageBlob,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const statusCode = response.status;
        let errorMessage: string;
        
        if (statusCode === 401 || statusCode === 403) {
          errorMessage = 'Authentication failed. Please check your Hugging Face API token.';
        } else if (statusCode === 429) {
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (statusCode === 503) {
          // Model loading error - will retry
          errorMessage = 'Model is loading. Please wait...';
        } else if (statusCode >= 500) {
          errorMessage = 'Service temporarily unavailable. Please try again later.';
        } else {
          errorMessage = `Hugging Face API error: ${statusCode} ${response.statusText}`;
        }
        
        console.error(`[diseaseService] Hugging Face API error (attempt ${attempt}/${maxRetries}):`, errorMessage);
        
        // Don't retry for authentication or rate limit errors
        if (statusCode === 401 || statusCode === 403 || statusCode === 429) {
          throw new Error(errorMessage);
        }
        
        // Retry for 503 (model loading) and other server errors
        if (statusCode === 503 && attempt < maxRetries) {
          console.log(`[diseaseService] Retrying in ${retryDelay / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('[diseaseService] Hugging Face API response received:', data);
      
      // Check if response indicates model is loading
      if (!Array.isArray(data) && data.error && data.error.includes('loading')) {
        if (attempt < maxRetries) {
          const waitTime = data.estimated_time ? Math.ceil(data.estimated_time) : retryDelay / 1000;
          console.log(`[diseaseService] Model is loading. Retrying in ${waitTime} seconds...`);
          await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
          continue;
        }
        throw new Error('Model loading timeout. Please try again later.');
      }
      
      return data;
      
    } catch (error) {
      // Handle timeout and network errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout. Please check your connection and try again.');
        }
        
        // Re-throw known errors
        if (error.message.includes('Authentication') || 
            error.message.includes('Rate limit') ||
            error.message.includes('Model loading timeout')) {
          throw error;
        }
        
        // Retry on network errors
        if (attempt < maxRetries && 
            (error.message.includes('network') || error.message.includes('fetch'))) {
          console.log(`[diseaseService] Network error (attempt ${attempt}/${maxRetries}). Retrying...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        throw new Error(`Unable to connect. Please check your internet connection. ${error.message}`);
      }
      
      throw new Error('An unexpected error occurred while calling Hugging Face API');
    }
  }
  
  throw new Error('Maximum retries exceeded. Please try again later.');
}

/**
 * Calls Groq AI for enhanced disease information (optional)
 * @param diseaseLabel - Disease label to enhance
 * @param language - Language for response ('en', 'hi', 'te')
 * @returns Promise resolving to enhanced disease information
 */
export async function callGroqAI(
  diseaseLabel: string,
  language: 'en' | 'hi' | 'te' = 'en'
): Promise<import('../types/diseaseTypes').GroqEnhancementResponse | null> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  // Groq AI is optional - return null if not configured
  if (!apiKey) {
    console.log('[diseaseService] Groq AI not configured, skipping enhancement');
    return null;
  }
  
  const languageNames = {
    en: 'English',
    hi: 'Hindi',
    te: 'Telugu'
  };
  
  const prompt = `You are an agricultural expert. Provide detailed information about the plant disease: "${diseaseLabel}".

Please provide the following in ${languageNames[language]}:
1. A detailed description of the disease
2. Treatment recommendations (both chemical and organic)
3. List of symptoms to look for
4. Organic/natural solutions

Format your response as JSON with these fields:
{
  "description": "detailed description",
  "treatment": "treatment recommendations",
  "symptoms": ["symptom1", "symptom2", ...],
  "organicSolutions": ["solution1", "solution2", ...]
}`;
  
  try {
    console.log(`[diseaseService] Calling Groq AI for disease: ${diseaseLabel} in ${language}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`[diseaseService] Groq AI error: ${response.status} ${response.statusText}`);
      return null; // Fail gracefully
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.warn('[diseaseService] Groq AI returned empty response');
      return null;
    }
    
    // Try to parse JSON from response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('[diseaseService] Groq AI enhancement received');
        return parsed;
      }
    } catch (parseError) {
      console.warn('[diseaseService] Failed to parse Groq AI response as JSON');
    }
    
    return null;
    
  } catch (error) {
    // Fail gracefully - Groq AI is optional
    console.warn('[diseaseService] Groq AI error (failing gracefully):', error);
    return null;
  }
}

/**
 * Merges Groq AI enhanced information with detection result
 * @param result - Base detection result
 * @param enhancement - Groq AI enhancement response
 * @returns Merged detection result
 */
export function mergeEnhancedInfo(
  result: Partial<import('../types/diseaseTypes').DetectionResult>,
  enhancement: import('../types/diseaseTypes').GroqEnhancementResponse | null
): Partial<import('../types/diseaseTypes').DetectionResult> {
  if (!enhancement) {
    return result;
  }
  
  return {
    ...result,
    description: enhancement.description || result.description,
    treatment: enhancement.treatment || result.treatment,
    symptoms: enhancement.symptoms && enhancement.symptoms.length > 0 
      ? enhancement.symptoms 
      : result.symptoms,
    organicSolutions: enhancement.organicSolutions && enhancement.organicSolutions.length > 0
      ? enhancement.organicSolutions
      : result.organicSolutions
  };
}

/**
 * Calls Plant.id API for plant and disease identification
 * @param base64Image - Base64 encoded image string
 * @returns Promise resolving to Plant.id API response
 * @throws ErrorContext with classified error type
 */
async function callPlantIdAPI(base64Image: string): Promise<PlantIdResponse> {
  const apiKey = import.meta.env.VITE_PLANT_ID_API_KEY;
  
  if (!apiKey) {
    const error = new Error('Plant.id API key not configured. Please set VITE_PLANT_ID_API_KEY in .env file.');
    const errorContext: ErrorContext = {
      type: ErrorType.MISSING_API_KEY,
      message: error.message,
      originalError: error,
      apiName: 'Plant.id'
    };
    console.error('[diseaseService] Plant.id API key missing:', errorContext);
    throw errorContext;
  }
  
  const apiUrl = import.meta.env.VITE_PLANT_ID_API_URL || 'https://api.plant.id/v2/identify';
  
  const requestBody: PlantIdRequest = {
    images: [base64Image],
    modifiers: ['health_assessment', 'disease_similar_images'],
    plant_details: ['common_names', 'taxonomy', 'url']
  };
  
  console.log(`[diseaseService] Calling Plant.id API at ${apiUrl}`);
  console.log(`[diseaseService] Request image size: ${(base64Image.length / 1024).toFixed(2)}KB`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorMessage: string;
      const statusCode = response.status;
      
      if (statusCode === 401 || statusCode === 403) {
        errorMessage = 'Authentication failed. Please check your Plant.id API key.';
      } else if (statusCode === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (statusCode >= 500) {
        errorMessage = 'Plant.id service temporarily unavailable. Trying fallback...';
      } else {
        errorMessage = `Plant.id API error: ${statusCode} ${response.statusText}`;
      }
      
      const error = new Error(errorMessage);
      const errorContext: ErrorContext = {
        type: classifyError(error, statusCode),
        message: errorMessage,
        originalError: error,
        statusCode,
        apiName: 'Plant.id'
      };
      
      console.error('[diseaseService] Plant.id API error:', errorContext);
      throw errorContext;
    }
    
    const data = await response.json();
    console.log('[diseaseService] Plant.id API response received:', data);
    
    return data;
  } catch (error) {
    // If error is already an ErrorContext, re-throw it
    if (error && typeof error === 'object' && 'type' in error && 'apiName' in error) {
      throw error;
    }
    
    // Handle fetch errors (timeout, network, etc.)
    if (error instanceof Error) {
      const errorContext: ErrorContext = {
        type: classifyError(error),
        message: error.name === 'AbortError' 
          ? 'Request timeout. Please check your connection and try again.'
          : error.message,
        originalError: error,
        apiName: 'Plant.id'
      };
      
      console.error('[diseaseService] Plant.id API error:', errorContext);
      throw errorContext;
    }
    
    // Handle unknown errors
    const unknownError = new Error('Unknown error occurred while calling Plant.id API');
    const errorContext: ErrorContext = {
      type: ErrorType.NETWORK_ERROR,
      message: unknownError.message,
      originalError: unknownError,
      apiName: 'Plant.id'
    };
    
    console.error('[diseaseService] Plant.id unknown error:', errorContext);
    throw errorContext;
  }
}

/**
 * Calls PlantNet API for plant identification (fallback)
 * @param base64Image - Base64 encoded image string
 * @returns Promise resolving to PlantNet API response
 * @throws ErrorContext with classified error type
 */
async function callPlantNetAPI(base64Image: string): Promise<PlantNetResponse> {
  const apiKey = import.meta.env.VITE_PLANTNET_API_KEY;
  
  if (!apiKey) {
    const error = new Error('PlantNet API key not configured. Please set VITE_PLANTNET_API_KEY in .env file.');
    const errorContext: ErrorContext = {
      type: ErrorType.MISSING_API_KEY,
      message: error.message,
      originalError: error,
      apiName: 'PlantNet'
    };
    console.error('[diseaseService] PlantNet API key missing:', errorContext);
    throw errorContext;
  }
  
  const apiUrl = import.meta.env.VITE_PLANTNET_API_URL || 'https://my-api.plantnet.org/v2/identify/all';
  
  const requestBody: PlantNetRequest = {
    images: [base64Image],
    organs: ['leaf']
  };
  
  console.log(`[diseaseService] Calling PlantNet API at ${apiUrl}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    
    const response = await fetch(`${apiUrl}?api-key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const statusCode = response.status;
      let errorMessage: string;
      
      if (statusCode === 401 || statusCode === 403) {
        errorMessage = 'Authentication failed. Please check your PlantNet API key.';
      } else if (statusCode === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (statusCode >= 500) {
        errorMessage = 'PlantNet service temporarily unavailable.';
      } else {
        errorMessage = `PlantNet API error: ${statusCode} ${response.statusText}`;
      }
      
      const error = new Error(errorMessage);
      const errorContext: ErrorContext = {
        type: classifyError(error, statusCode),
        message: errorMessage,
        originalError: error,
        statusCode,
        apiName: 'PlantNet'
      };
      
      console.error('[diseaseService] PlantNet API error:', errorContext);
      throw errorContext;
    }
    
    const data = await response.json();
    console.log('[diseaseService] PlantNet API response received:', data);
    
    return data;
  } catch (error) {
    // If error is already an ErrorContext, re-throw it
    if (error && typeof error === 'object' && 'type' in error && 'apiName' in error) {
      throw error;
    }
    
    // Handle fetch errors (timeout, network, etc.)
    if (error instanceof Error) {
      const errorContext: ErrorContext = {
        type: classifyError(error),
        message: error.name === 'AbortError' 
          ? 'Request timeout. Please check your connection and try again.'
          : error.message,
        originalError: error,
        apiName: 'PlantNet'
      };
      
      console.error('[diseaseService] PlantNet API error:', errorContext);
      throw errorContext;
    }
    
    // Handle unknown errors
    const unknownError = new Error('Unknown error occurred while calling PlantNet API');
    const errorContext: ErrorContext = {
      type: ErrorType.NETWORK_ERROR,
      message: unknownError.message,
      originalError: unknownError,
      apiName: 'PlantNet'
    };
    
    console.error('[diseaseService] PlantNet unknown error:', errorContext);
    throw errorContext;
  }
}

/**
 * Looks up disease information from local knowledge base
 * @param diseaseName - Name of the disease to look up
 * @param language - Language code (en, hi, te)
 * @returns Disease knowledge entry or null if not found
 */
function getDiseaseInfo(
  diseaseName: string,
  language: 'en' | 'hi' | 'te' = 'en'
): DiseaseKnowledgeEntry | null {
  const normalizedDiseaseName = diseaseName.toLowerCase().trim();
  
  const disease = diseaseDatabase.diseases.find(d => 
    d.diseaseName.toLowerCase().includes(normalizedDiseaseName) ||
    normalizedDiseaseName.includes(d.diseaseName.toLowerCase())
  );
  
  if (disease) {
    console.log(`[diseaseService] Found disease in knowledge base: ${disease.diseaseName}`);
    return disease;
  }
  
  console.log(`[diseaseService] Disease not found in knowledge base: ${diseaseName}`);
  return null;
}

/**
 * Formats detection result with knowledge base data
 * @param result - Partial detection result from API
 * @param language - Language code (en, hi, te)
 * @returns Complete detection result with treatment information
 */
export function formatDetectionResult(
  result: Partial<DetectionResult>,
  language: 'en' | 'hi' | 'te' = 'en'
): DetectionResult {
  const diseaseInfo = result.diseaseName ? getDiseaseInfo(result.diseaseName, language) : null;
  
  const formattedResult: DetectionResult = {
    plantName: result.plantName,
    diseaseName: result.diseaseName || 'Disease not detected clearly',
    confidence: result.confidence || 0,
    treatment: result.treatment || 'Consult an agricultural expert for proper diagnosis and treatment.',
    description: result.description,
    symptoms: result.symptoms || [],
    pesticides: result.pesticides || [],
    organicSolutions: result.organicSolutions || [],
    lowConfidenceWarning: (result.confidence || 0) < LOW_CONFIDENCE_THRESHOLD,
    timestamp: new Date().toISOString()
  };
  
  // Enhance with knowledge base data if available
  if (diseaseInfo) {
    formattedResult.symptoms = diseaseInfo.symptoms[language] || diseaseInfo.symptoms.en;
    formattedResult.treatment = diseaseInfo.treatment[language] || diseaseInfo.treatment.en;
    formattedResult.description = diseaseInfo.description[language] || diseaseInfo.description.en;
    formattedResult.pesticides = diseaseInfo.pesticides;
    formattedResult.organicSolutions = diseaseInfo.organicSolutions[language] || diseaseInfo.organicSolutions.en;
  } else if (!result.diseaseName || result.diseaseName === 'Disease not detected clearly') {
    // Provide general plant care tips when no disease is detected
    formattedResult.treatment = language === 'hi' 
      ? 'कोई बीमारी स्पष्ट रूप से नहीं पाई गई। सामान्य पौधे की देखभाल: नियमित रूप से पानी दें, उचित धूप सुनिश्चित करें, और पौधे के स्वास्थ्य की निगरानी करें।'
      : language === 'te'
      ? 'వ్యాధి స్పష్టంగా గుర్తించబడలేదు. సాధారణ మొక్క సంరక్షణ: క్రమం తప్పకుండా నీరు పోయండి, తగినంత సూర్యరశ్మిని నిర్ధారించండి, మరియు మొక్క ఆరోగ్యాన్ని పర్యవేక్షించండి.'
      : 'No disease clearly detected. General plant care: Water regularly, ensure adequate sunlight, and monitor plant health. If symptoms persist, consult an agricultural expert.';
    
    formattedResult.organicSolutions = language === 'hi'
      ? ['नियमित रूप से पौधे का निरीक्षण करें', 'उचित जल निकासी सुनिश्चित करें', 'जैविक खाद का उपयोग करें', 'पौधों के बीच उचित दूरी बनाए रखें']
      : language === 'te'
      ? ['క్రమం తప్పకుండా మొక్కను తనిఖీ చేయండి', 'సరైన డ్రైనేజీని నిర్ధారించండి', 'సేంద్రీయ ఎరువులను ఉపయోగించండి', 'మొక్కల మధ్య సరైన అంతరాన్ని కొనసాగించండి']
      : ['Inspect plants regularly', 'Ensure proper drainage', 'Use organic fertilizers', 'Maintain proper plant spacing'];
  }
  
  return formattedResult;
}

/**
 * Gets color class for confidence score display
 * @param confidence - Confidence score (0-100)
 * @returns CSS color class name
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence > 80) {
    return 'text-green-600';
  } else if (confidence >= 50) {
    return 'text-yellow-600';
  } else {
    return 'text-red-600';
  }
}

/**
 * Main disease detection function
 * Detects plant diseases from Base64 image using Plant.id API (with PlantNet fallback)
 * @param base64Image - Base64 encoded image string
 * @param language - Language code for results (en, hi, te)
 * @returns Promise resolving to complete detection result
 */
export async function detectDisease(
  base64Image: string,
  language: 'en' | 'hi' | 'te' = 'en'
): Promise<DetectionResult> {
  console.log('[diseaseService] Starting disease detection...');
  
  let plantIdError: ErrorContext | null = null;
  let plantNetError: ErrorContext | null = null;
  
  try {
    // Try Plant.id API first
    try {
      const plantIdResponse = await callPlantIdAPI(base64Image);
      
      // Parse Plant.id response
      let plantName: string | undefined;
      let diseaseName: string | undefined;
      let confidence = 0;
      let description: string | undefined;
      let treatment: string | undefined;
      
      // Extract plant name
      if (plantIdResponse.suggestions && plantIdResponse.suggestions.length > 0) {
        const topSuggestion = plantIdResponse.suggestions[0];
        plantName = topSuggestion.plant_details?.common_names?.[0] || topSuggestion.plant_name;
        console.log(`[diseaseService] Parsed plant name: ${plantName}`);
      }
      
      // Extract disease information
      if (plantIdResponse.health_assessment?.diseases && plantIdResponse.health_assessment.diseases.length > 0) {
        const topDisease = plantIdResponse.health_assessment.diseases[0];
        diseaseName = topDisease.name;
        confidence = Math.round(topDisease.probability * 100);
        description = topDisease.disease_details?.description;
        treatment = topDisease.disease_details?.treatment;
        
        console.log(`[diseaseService] Parsed disease: ${diseaseName}, confidence: ${confidence}%`);
      } else if (plantIdResponse.health_assessment?.is_healthy) {
        diseaseName = 'No disease detected - plant appears healthy';
        confidence = 90;
        console.log('[diseaseService] Plant appears healthy');
      }
      
      // Format and return result
      const partialResult: Partial<DetectionResult> = {
        plantName,
        diseaseName,
        confidence,
        description,
        treatment
      };
      
      return formatDetectionResult(partialResult, language);
      
    } catch (error) {
      // Capture Plant.id error context
      if (error && typeof error === 'object' && 'type' in error && 'apiName' in error) {
        plantIdError = error as ErrorContext;
      } else if (error instanceof Error) {
        plantIdError = {
          type: classifyError(error),
          message: error.message,
          originalError: error,
          apiName: 'Plant.id'
        };
      } else {
        plantIdError = {
          type: ErrorType.NETWORK_ERROR,
          message: 'Unknown error occurred',
          originalError: new Error('Unknown error'),
          apiName: 'Plant.id'
        };
      }
      
      console.warn('[diseaseService] Plant.id API failed, trying PlantNet fallback...', plantIdError);
      
      // Try PlantNet API as fallback
      try {
        const plantNetResponse = await callPlantNetAPI(base64Image);
        
        // Parse PlantNet response (plant identification only)
        let plantName: string | undefined;
        let confidence = 0;
        
        if (plantNetResponse.results && plantNetResponse.results.length > 0) {
          const topResult = plantNetResponse.results[0];
          plantName = topResult.species?.commonNames?.[0] || topResult.species?.scientificNameWithoutAuthor;
          confidence = Math.round(topResult.score * 100);
          
          console.log(`[diseaseService] PlantNet identified plant: ${plantName}, confidence: ${confidence}%`);
        }
        
        // PlantNet doesn't provide disease detection, so we return plant identification only
        const partialResult: Partial<DetectionResult> = {
          plantName,
          diseaseName: 'Disease detection unavailable - plant identification only',
          confidence,
          description: 'PlantNet API provides plant identification but not disease detection. Please consult an expert for disease diagnosis.'
        };
        
        return formatDetectionResult(partialResult, language);
        
      } catch (plantNetErr) {
        // Capture PlantNet error context
        if (plantNetErr && typeof plantNetErr === 'object' && 'type' in plantNetErr && 'apiName' in plantNetErr) {
          plantNetError = plantNetErr as ErrorContext;
        } else if (plantNetErr instanceof Error) {
          plantNetError = {
            type: classifyError(plantNetErr),
            message: plantNetErr.message,
            originalError: plantNetErr,
            apiName: 'PlantNet'
          };
        } else {
          plantNetError = {
            type: ErrorType.NETWORK_ERROR,
            message: 'Unknown error occurred',
            originalError: new Error('Unknown error'),
            apiName: 'PlantNet'
          };
        }
        
        console.error('[diseaseService] Both Plant.id and PlantNet APIs failed');
        
        // Build specific error message based on both error contexts
        const errorMessage = buildErrorMessage(plantIdError, plantNetError);
        throw new Error(errorMessage);
      }
    }
    
  } catch (error) {
    console.error('[diseaseService] Disease detection error:', error);
    
    if (error instanceof Error) {
      // Re-throw known errors
      throw error;
    }
    
    // Handle unknown errors
    throw new Error('An unexpected error occurred during disease detection. Please try again.');
  }
}

/**
 * Detects disease from image file using Hugging Face API
 * Main entry point for disease detection with new implementation
 * @param file - Image file to analyze
 * @param language - Language code for results (en, hi, te)
 * @returns Promise resolving to complete detection result
 */
export async function detectDiseaseFromFile(
  file: File,
  language: 'en' | 'hi' | 'te' = 'en'
): Promise<DetectionResult> {
  console.log('[diseaseService] Starting disease detection with Hugging Face API...');
  
  // Step 1: Validate environment configuration
  const envValidation = validateEnvironmentConfig();
  if (!envValidation.isValid) {
    throw new Error(envValidation.error);
  }
  
  // Step 2: Validate image format and size
  const validation = validateImageFormat(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  // Step 3: Compress image if needed, otherwise convert to Blob
  let imageBlob: Blob;
  if (file.size > COMPRESSION_THRESHOLD_BYTES) {
    console.log('[diseaseService] Image exceeds compression threshold, compressing...');
    imageBlob = await compressImage(file);
  } else {
    imageBlob = await convertToBlob(file);
  }
  
  // Step 4: Call Hugging Face API for disease detection
  const apiResponse = await callHuggingFaceAPI(imageBlob);
  
  // Step 5: Extract top prediction
  const topPrediction = extractTopPrediction(apiResponse);
  
  // Step 6: Format disease label
  const formattedLabel = formatDiseaseLabel(topPrediction.label);
  
  // Step 7: Build partial result
  const partialResult: Partial<DetectionResult> = {
    diseaseName: formattedLabel,
    confidence: Math.round(topPrediction.score * 100),
    treatment: 'Treatment information will be provided.',
    description: `Detected: ${formattedLabel}`
  };
  
  // Step 8: Optionally enhance with Groq AI
  const enhancement = await callGroqAI(formattedLabel, language);
  const enhancedResult = mergeEnhancedInfo(partialResult, enhancement);
  
  // Step 9: Format and return complete result
  return formatDetectionResult(enhancedResult, language);
}

/**
 * Detects disease from image file (legacy Plant.id implementation)
 * @deprecated Use detectDiseaseFromFile instead
 * @param file - Image file to analyze
 * @param language - Language code for results (en, hi, te)
 * @returns Promise resolving to complete detection result
 */
export async function detectDiseaseFromFileLegacy(
  file: File,
  language: 'en' | 'hi' | 'te' = 'en'
): Promise<DetectionResult> {
  // Validate image
  const validation = validateImageFormat(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  // Convert or compress image
  let base64Image: string;
  if (file.size > COMPRESSION_THRESHOLD_BYTES) {
    console.log('[diseaseService] Image exceeds compression threshold, compressing...');
    base64Image = await compressImage(file) as any; // Type mismatch - legacy code
  } else {
    base64Image = await convertToBase64(file);
  }
  
  // Detect disease
  return detectDisease(base64Image, language);
}
