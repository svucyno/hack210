import type {
  Language,
  GroqChatRequest,
  GroqChatResponse,
  FarmerAdviceResponse,
} from '../types/farmerAssistantTypes';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Builds the system prompt with agriculture-only constraints
 */
function buildSystemPrompt(language: Language): string {
  const languageInstruction = language === 'te' 
    ? 'Respond fully in Telugu' 
    : 'Respond fully in English';

  return `You are an agricultural expert assistant. Answer ONLY farming and agriculture questions. Use very simple language. Give practical advice. Use bullet points. ${languageInstruction}. If the question is not about farming, respond with: 'I can help only with farming questions'`;
}

/**
 * Builds the request body for Groq API
 */
function buildRequestBody(message: string, systemPrompt: string): GroqChatRequest {
  return {
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
  };
}

/**
 * Gets farming advice from Groq API
 * @param message - The user's question
 * @param language - The selected language ('en' or 'te')
 * @returns Promise with the AI response
 * @throws Error if API key is missing or request fails
 */
export async function getFarmerAdvice(
  message: string,
  language: Language
): Promise<FarmerAdviceResponse> {
  // Validate API key
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Configuration error: Missing API key');
  }

  const systemPrompt = buildSystemPrompt(language);
  const requestBody = buildRequestBody(message, systemPrompt);

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('Groq API error:', response.status, response.statusText);
      throw new Error('Try again later');
    }

    const data: GroqChatResponse = await response.json();
    
    // Extract response from choices[0].message.content
    const output = data.choices[0]?.message?.content;
    
    if (!output) {
      console.error('Invalid response format from Groq API');
      throw new Error('Try again later');
    }

    return { output };
  } catch (error) {
    // Handle timeout
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Request timeout');
      throw new Error('Try again later');
    }

    // Handle network errors
    if (error instanceof TypeError) {
      console.error('Network error:', error);
      throw new Error('Try again later');
    }

    // Re-throw if already a user-friendly error
    if (error instanceof Error && 
        (error.message === 'Try again later' || 
         error.message.startsWith('Configuration error'))) {
      throw error;
    }

    // Log and throw generic error for unexpected cases
    console.error('Unexpected error:', error);
    throw new Error('Try again later');
  }
}
