/**
 * Government Scheme Assistant Service
 * Uses multiple Gemini API keys with automatic fallback
 */

const API_TIMEOUT_MS = 30000;

// Get all available API keys
const GEMINI_API_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY_1,
  import.meta.env.VITE_GEMINI_API_KEY_2,
  import.meta.env.VITE_GEMINI_API_KEY_3,
  import.meta.env.VITE_GEMINI_API_KEY, // Fallback to legacy key
].filter(key => key && key !== 'your_gemini_key_2_here' && key !== 'your_gemini_key_3_here');

export interface SchemeResponse {
  schemeName: string;
  eligibility: string[];
  benefits: string[];
  steps: string[];
  documents: string[];
  rawResponse: string;
}

/**
 * Calls Gemini API with automatic key fallback
 */
async function callGeminiWithFallback(
  prompt: string,
  language: 'en' | 'hi' | 'te' = 'en'
): Promise<string> {
  console.log(`[schemeService] Starting Gemini API call with ${GEMINI_API_KEYS.length} keys available`);
  
  if (GEMINI_API_KEYS.length === 0) {
    throw new Error('No Gemini API keys configured. Please add VITE_GEMINI_API_KEY_1 to your .env file.');
  }

  let lastError: Error | null = null;

  // Try each API key in sequence
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const apiKey = GEMINI_API_KEYS[i];
    console.log(`[schemeService] Trying API key ${i + 1}/${GEMINI_API_KEYS.length}`);

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
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Check for rate limit (429) or quota exceeded (403)
        if (response.status === 429 || response.status === 403) {
          console.warn(`[schemeService] API key ${i + 1} rate limited or quota exceeded, trying next key...`);
          lastError = new Error(`Rate limit exceeded for key ${i + 1}`);
          continue; // Try next key
        }
        
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('No response from Gemini API');
      }

      console.log(`[schemeService] Success with API key ${i + 1}`);
      return text;

    } catch (error) {
      console.error(`[schemeService] Error with API key ${i + 1}:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // If this is the last key, throw the error
      if (i === GEMINI_API_KEYS.length - 1) {
        break;
      }
      
      // Otherwise, try next key
      continue;
    }
  }

  // All keys failed
  throw new Error(
    lastError?.message || 'All API keys failed. Service is temporarily unavailable. Please try again later.'
  );
}

/**
 * Parses Gemini response into structured format
 */
function parseSchemeResponse(response: string): SchemeResponse {
  const lines = response.split('\n').map(line => line.trim()).filter(line => line);
  
  let schemeName = 'Government Scheme';
  const eligibility: string[] = [];
  const benefits: string[] = [];
  const steps: string[] = [];
  const documents: string[] = [];
  
  let currentSection = '';
  
  for (const line of lines) {
    if (line.toLowerCase().includes('scheme name:') || line.toLowerCase().includes('scheme:')) {
      schemeName = line.split(':')[1]?.trim() || schemeName;
    } else if (line.toLowerCase().includes('eligibility:')) {
      currentSection = 'eligibility';
    } else if (line.toLowerCase().includes('benefits:') || line.toLowerCase().includes('benefit:')) {
      currentSection = 'benefits';
    } else if (line.toLowerCase().includes('steps:') || line.toLowerCase().includes('how to apply:')) {
      currentSection = 'steps';
    } else if (line.toLowerCase().includes('documents:') || line.toLowerCase().includes('required documents:')) {
      currentSection = 'documents';
    } else if (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./)) {
      const point = line.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (currentSection === 'eligibility') {
        eligibility.push(point);
      } else if (currentSection === 'benefits') {
        benefits.push(point);
      } else if (currentSection === 'steps') {
        steps.push(point);
      } else if (currentSection === 'documents') {
        documents.push(point);
      }
    }
  }
  
  return {
    schemeName,
    eligibility,
    benefits,
    steps,
    documents,
    rawResponse: response
  };
}

/**
 * Get government scheme details using AI
 */
export async function getSchemeDetails(
  query: string,
  language: 'en' | 'hi' | 'te' = 'en'
): Promise<SchemeResponse> {
  console.log('[schemeService] Getting scheme details for query:', query);
  
  if (!query || query.trim() === '') {
    throw new Error('Please enter a query about government schemes.');
  }

  const languageNames = {
    en: 'English',
    hi: 'Hindi',
    te: 'Telugu'
  };

  const prompt = `You are an expert assistant for Indian government agriculture schemes.

User Query: ${query}

Tasks:
1. Identify the most relevant government scheme
2. Explain it in simple ${languageNames[language]} language
3. Provide eligibility criteria
4. List benefits
5. Give step-by-step application process
6. List required documents

Special Instructions:
- If the query mentions Andhra Pradesh, include information about YSR Rythu Bharosa scheme
- If the query mentions Telangana, include information about Rythu Bandhu scheme
- Use simple language that farmers can understand
- Use bullet points for lists
- Keep answers concise and practical

Format your response EXACTLY like this:

Scheme Name: [Name of the scheme]

Eligibility:
- [Eligibility criterion 1]
- [Eligibility criterion 2]
- [Eligibility criterion 3]

Benefits:
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

Steps to Apply:
- [Step 1]
- [Step 2]
- [Step 3]

Required Documents:
- [Document 1]
- [Document 2]
- [Document 3]`;

  try {
    const response = await callGeminiWithFallback(prompt, language);
    return parseSchemeResponse(response);
  } catch (error) {
    console.error('[schemeService] Error:', error);
    throw error;
  }
}
