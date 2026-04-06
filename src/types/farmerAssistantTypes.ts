/**
 * Type definitions for Farmer Assistant feature
 */

/**
 * Language options for the assistant
 */
export type Language = 'en' | 'te';

/**
 * Message in Groq API format
 */
export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Request to Groq API
 */
export interface GroqChatRequest {
  model: string;
  messages: GroqMessage[];
}

/**
 * Choice object in Groq response
 */
export interface GroqChoice {
  index: number;
  message: GroqMessage;
  finish_reason: string;
}

/**
 * Response from Groq API
 */
export interface GroqChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: GroqChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Service response format
 */
export interface FarmerAdviceResponse {
  output: string;
}

/**
 * Component state interface
 */
export interface FarmerAssistantState {
  question: string;
  language: Language;
  response: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * TTS configuration
 */
export interface TTSConfig {
  text: string;
  language: Language;
  rate?: number;
  pitch?: number;
  volume?: number;
}
