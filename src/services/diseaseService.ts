/**
 * Disease Detection Service using Groq AI with fallback
 * Provides text-based and optional image-based plant disease identification
 */

import type {
  DetectionResult,
  ValidationResult,
  DiseaseInput
} from '../types/diseaseTypes';

// Re-export types for convenience
export type { DetectionResult, ValidationResult, DiseaseInput } from '../types/diseaseTypes';

// Constants
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
const API_TIMEOUT_MS = 30000;

// Get all available Groq API keys
const GROQ_API_KEYS = [
  import.meta.env.VITE_GROQ_API_KEY_1,
  import.meta.env.VITE_GROQ_API_KEY_2,
  import.meta.env.VITE_GROQ_API_KEY, // Fallback to legacy key
].filter(key => key && key !== 'your_groq_key_2_here');

// Get all available Gemini API keys
const GEMINI_API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY_1,
  import.meta.env.VITE_GEMINI_API_KEY_2,
  import.meta.env.VITE_GEMINI_API_KEY_3,
  import.meta.env.VITE_GEMINI_API_KEY, // Fallback to legacy key
].filter(key => key && key !== 'your_gemini_key_2_here' && key !== 'your_gemini_key_3_here');

/**
 * Validates environment configuration for Groq API
 */
export function validateEnvironmentConfig(): ValidationResult {
  if (GROQ_API_KEYS.length === 0) {
    return {
      isValid: false,
      error: 'Groq API key not configured. Please set VITE_GROQ_API_KEY_1 in environment variables.'
    };
  }
  
  return { isValid: true };
}

/**
 * Validates image file format and size
 */
export function validateImageFormat(file: File): ValidationResult {
  if (!file) {
    return {
      isValid: false,
      error: 'No file selected. Please choose an image file.'
    };
  }

  if (!ACCEPTED_FORMATS.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Please upload JPEG, PNG, or WebP images only.`
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please choose a smaller image.`
    };
  }

  return { isValid: true };
}

/**
 * Converts image file to base64 string for Gemini Vision API
 */
export async function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to convert image to base64'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Calls Gemini Vision API to detect disease from image with fallback
 * Exported for use in PesticideDetector component
 */
export async function callGeminiVisionAPI(base64Image: string): Promise<string> {
  console.log(`[diseaseService] Starting Gemini Vision with ${GEMINI_API_KEYS.length} keys available`);
  
  if (GEMINI_API_KEYS.length === 0) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `You are an expert plant pathologist. Analyze this plant image and identify any disease.

Provide ONLY the disease name in this exact format:
Disease: [disease name]

If no disease is visible, respond with:
Disease: Healthy Plant

Be specific and concise.`;

  let lastError: Error | null = null;

  // Try each API key
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const apiKey = GEMINI_API_KEYS[i];
    console.log(`[diseaseService] Trying Gemini key ${i + 1}/${GEMINI_API_KEYS.length}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Image
                  }
                }
              ]
            }]
          }),
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Check for rate limit
        if (response.status === 429 || response.status === 403) {
          console.warn(`[diseaseService] Gemini key ${i + 1} rate limited, trying next...`);
          lastError = new Error(`Rate limit exceeded for key ${i + 1}`);
          continue;
        }
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extract disease name
      const match = text.match(/Disease:\s*(.+)/i);
      if (match) {
        console.log(`[diseaseService] Success with Gemini key ${i + 1}`);
        return match[1].trim();
      }
      
      return 'Unknown Disease';
      
    } catch (error) {
      console.error(`[diseaseService] Gemini key ${i + 1} error:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (i === GEMINI_API_KEYS.length - 1) {
        break;
      }
      continue;
    }
  }
  
  throw new Error(lastError?.message || 'Failed to analyze image. Please try text-based detection.');
}

/**
 * Calls Groq AI for disease detection and treatment recommendations with fallback
 */
async function callGroqAI(input: DiseaseInput, language: 'en' | 'hi' | 'te' = 'en'): Promise<DetectionResult> {
  console.log(`[diseaseService] Starting Groq AI with ${GROQ_API_KEYS.length} keys available`);
  
  if (GROQ_API_KEYS.length === 0) {
    throw new Error('Groq API key not configured. Please set VITE_GROQ_API_KEY_1 in environment variables.');
  }

  const languageNames = {
    en: 'English',
    hi: 'Hindi',
    te: 'Telugu'
  };

  const prompt = `You are an expert plant doctor helping farmers. Provide practical advice in simple ${languageNames[language]} language.

Crop: ${input.crop || 'Not specified'}
Symptoms: ${input.symptoms || 'Not specified'}
Location: ${input.location || 'Not specified'}
${input.detectedDisease ? `Detected Disease from Image: ${input.detectedDisease}` : ''}

Tasks:
1. Identify the most likely disease
2. Explain the cause in simple terms
3. Suggest practical treatment (both chemical and organic options)
4. Recommend 2-3 common pesticides available in India
5. Give prevention tips

Format your response EXACTLY like this:

Disease: [disease name]

Cause:
- [cause point 1]
- [cause point 2]

Treatment:
- [treatment step 1]
- [treatment step 2]
- [treatment step 3]

Recommended Products:
- [Pesticide name 1]
- [Pesticide name 2]
- [Pesticide name 3]

Prevention:
- [prevention tip 1]
- [prevention tip 2]
- [prevention tip 3]

Use bullet points and keep language simple for farmers. For pesticides, use common Indian brand names like Tata Rallis, Bayer, Syngenta, UPL, etc.`;

  let lastError: Error | null = null;

  // Try each API key
  for (let i = 0; i < GROQ_API_KEYS.length; i++) {
    const apiKey = GROQ_API_KEYS[i];
    console.log(`[diseaseService] Trying Groq key ${i + 1}/${GROQ_API_KEYS.length}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are an expert agricultural advisor helping farmers identify and treat plant diseases. Provide clear, practical advice.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Check for rate limit
        if (response.status === 429) {
          console.warn(`[diseaseService] Groq key ${i + 1} rate limited, trying next...`);
          lastError = new Error(`Rate limit exceeded for key ${i + 1}`);
          continue;
        }
        
        throw new Error(errorData.error?.message || `Groq API error: ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from Groq AI');
      }
      
      console.log(`[diseaseService] Success with Groq key ${i + 1}`);
      
      // Parse the response
      return parseGroqResponse(content, input);
      
    } catch (error) {
      console.error(`[diseaseService] Groq key ${i + 1} error:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (i === GROQ_API_KEYS.length - 1) {
        break;
      }
      continue;
    }
  }
  
  throw new Error(
    lastError?.message || 'All API keys failed. Service is temporarily unavailable. Please try again later.'
  );
}

/**
 * Parses Groq AI response into structured DetectionResult
 */
function parseGroqResponse(content: string, input: DiseaseInput): DetectionResult {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  let diseaseName = 'Unknown Disease';
  const causes: string[] = [];
  const treatments: string[] = [];
  const preventions: string[] = [];
  const pesticideNames: string[] = [];
  
  let currentSection = '';
  
  for (const line of lines) {
    if (line.startsWith('Disease:')) {
      diseaseName = line.replace('Disease:', '').trim();
    } else if (line.startsWith('Cause:')) {
      currentSection = 'cause';
    } else if (line.startsWith('Treatment:')) {
      currentSection = 'treatment';
    } else if (line.startsWith('Prevention:')) {
      currentSection = 'prevention';
    } else if (line.includes('Recommended Products:') || line.includes('Pesticides:')) {
      currentSection = 'pesticides';
    } else if (line.startsWith('-') || line.startsWith('•')) {
      const point = line.replace(/^[-•]\s*/, '').trim();
      if (currentSection === 'cause') {
        causes.push(point);
      } else if (currentSection === 'treatment') {
        treatments.push(point);
      } else if (currentSection === 'prevention') {
        preventions.push(point);
      } else if (currentSection === 'pesticides') {
        pesticideNames.push(point);
      }
    }
  }
  
  // Build treatment text
  const treatmentText = treatments.length > 0 
    ? treatments.join('\n• ')
    : 'Consult an agricultural expert for proper diagnosis and treatment.';
  
  // Build description from causes
  const description = causes.length > 0
    ? `Causes:\n• ${causes.join('\n• ')}`
    : 'Disease information not available.';
  
  // Generate pesticide links for Amazon India
  const pesticides = pesticideNames.slice(0, 3).map(name => ({
    name: name,
    buyLink: `https://www.amazon.in/s?k=${encodeURIComponent(name)}`
  }));
  
  return {
    diseaseName,
    confidence: input.detectedDisease ? 85 : 75,
    treatment: treatmentText,
    description,
    symptoms: input.symptoms ? [input.symptoms] : [],
    pesticides: pesticides.length > 0 ? pesticides : undefined,
    organicSolutions: preventions,
    timestamp: new Date().toISOString()
  };
}

/**
 * Detects disease from text input (primary method)
 */
export async function detectDiseaseFromText(
  input: DiseaseInput,
  language: 'en' | 'hi' | 'te' = 'en'
): Promise<DetectionResult> {
  console.log('[diseaseService] Starting text-based disease detection...');
  
  // Validate environment
  const envValidation = validateEnvironmentConfig();
  if (!envValidation.isValid) {
    throw new Error(envValidation.error);
  }
  
  // Validate input
  if (!input.symptoms || input.symptoms.trim() === '') {
    throw new Error('Please describe the symptoms you are observing.');
  }
  
  // Call Groq AI
  return await callGroqAI(input, language);
}

/**
 * Detects disease from image file (optional, uses Gemini + Groq)
 */
export async function detectDiseaseFromFile(
  file: File,
  input: DiseaseInput,
  language: 'en' | 'hi' | 'te' = 'en'
): Promise<DetectionResult> {
  console.log('[diseaseService] Starting image-based disease detection...');
  
  // Validate environment
  const envValidation = validateEnvironmentConfig();
  if (!envValidation.isValid) {
    throw new Error(envValidation.error);
  }
  
  // Validate image
  const validation = validateImageFormat(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }
  
  try {
    // Step 1: Convert image to base64
    const base64Image = await convertToBase64(file);
    
    // Step 2: Use Gemini to detect disease from image
    const detectedDisease = await callGeminiVisionAPI(base64Image);
    console.log(`[diseaseService] Gemini detected: ${detectedDisease}`);
    
    // Step 3: Use Groq to get detailed information
    const enhancedInput: DiseaseInput = {
      ...input,
      detectedDisease
    };
    
    return await callGroqAI(enhancedInput, language);
    
  } catch (error) {
    console.error('[diseaseService] Image detection error:', error);
    
    // Fallback to text-based detection if image analysis fails
    if (input.symptoms) {
      console.log('[diseaseService] Falling back to text-based detection...');
      return await detectDiseaseFromText(input, language);
    }
    
    throw error;
  }
}

/**
 * Gets color class for confidence score display
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
 * Pesticide recommendation result
 */
export interface PesticideRecommendation {
  name: string;
  usage: string;
  precautions: string;
  buyLink: string;
}

export interface PesticideResult {
  recommendations: PesticideRecommendation[];
  timestamp: string;
}

/**
 * Get pesticide recommendations based on disease or crop problem
 */
export async function getPesticideRecommendations(
  input: string,
  language: 'en' | 'hi' | 'te' = 'en'
): Promise<PesticideResult> {
  console.log('[diseaseService] Getting pesticide recommendations for:', input);
  
  if (!input || input.trim() === '') {
    throw new Error('Please describe the disease or crop problem.');
  }

  if (GROQ_API_KEYS.length === 0) {
    throw new Error('Groq API key not configured.');
  }

  const languageNames = {
    en: 'English',
    hi: 'Hindi',
    te: 'Telugu'
  };

  const prompt = `You are an agricultural expert helping Indian farmers.

Input: ${input}

Tasks:
1. Suggest 2-3 best pesticides available in India
2. Give clear usage instructions for each
3. Provide important precautions

Format your response EXACTLY like this:

Pesticide 1: [Name]
Usage: [How to use it]
Precautions: [Safety warnings]

Pesticide 2: [Name]
Usage: [How to use it]
Precautions: [Safety warnings]

Pesticide 3: [Name]
Usage: [How to use it]
Precautions: [Safety warnings]

Use simple ${languageNames[language]} language. Recommend common Indian brands like Tata Rallis, Bayer, Syngenta, UPL, etc.`;

  let lastError: Error | null = null;

  // Try each Groq API key
  for (let i = 0; i < GROQ_API_KEYS.length; i++) {
    const apiKey = GROQ_API_KEYS[i];
    console.log(`[diseaseService] Trying Groq key ${i + 1}/${GROQ_API_KEYS.length} for pesticides`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are an expert agricultural advisor helping farmers with pesticide recommendations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 429) {
          console.warn(`[diseaseService] Groq key ${i + 1} rate limited, trying next...`);
          lastError = new Error(`Rate limit exceeded for key ${i + 1}`);
          continue;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Groq API error: ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from Groq AI');
      }
      
      console.log(`[diseaseService] Success with Groq key ${i + 1}`);
      
      // Parse the response
      return parsePesticideResponse(content);
      
    } catch (error) {
      console.error(`[diseaseService] Groq key ${i + 1} error:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (i === GROQ_API_KEYS.length - 1) {
        break;
      }
      continue;
    }
  }
  
  throw new Error(
    lastError?.message || 'Failed to get pesticide recommendations. Please try again later.'
  );
}

/**
 * Parse pesticide recommendations from Groq response
 */
function parsePesticideResponse(content: string): PesticideResult {
  const recommendations: PesticideRecommendation[] = [];
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);
  
  let currentPesticide: Partial<PesticideRecommendation> = {};
  
  for (const line of lines) {
    if (line.match(/^Pesticide \d+:/i)) {
      // Save previous pesticide if exists
      if (currentPesticide.name) {
        recommendations.push({
          name: currentPesticide.name,
          usage: currentPesticide.usage || 'Follow product instructions',
          precautions: currentPesticide.precautions || 'Use protective equipment',
          buyLink: `https://www.amazon.in/s?k=${encodeURIComponent(currentPesticide.name)}`
        });
      }
      // Start new pesticide
      const name = line.split(':')[1]?.trim() || 'Pesticide';
      currentPesticide = { name };
    } else if (line.toLowerCase().startsWith('usage:')) {
      currentPesticide.usage = line.substring(line.indexOf(':') + 1).trim();
    } else if (line.toLowerCase().startsWith('precautions:') || line.toLowerCase().startsWith('precaution:')) {
      currentPesticide.precautions = line.substring(line.indexOf(':') + 1).trim();
    }
  }
  
  // Add last pesticide
  if (currentPesticide.name) {
    recommendations.push({
      name: currentPesticide.name,
      usage: currentPesticide.usage || 'Follow product instructions',
      precautions: currentPesticide.precautions || 'Use protective equipment',
      buyLink: `https://www.amazon.in/s?k=${encodeURIComponent(currentPesticide.name)}`
    });
  }
  
  return {
    recommendations: recommendations.slice(0, 3),
    timestamp: new Date().toISOString()
  };
}
