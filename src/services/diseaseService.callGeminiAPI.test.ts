/**
 * Unit tests for callGeminiAPI function
 * Tests the Gemini API integration for treatment recommendations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callGeminiAPI, type GeminiResponse } from './diseaseService';

describe('callGeminiAPI', () => {
  // Store original fetch
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Mock environment variable
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key');
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it('should make direct HTTP call to Gemini API with correct parameters', async () => {
    // Mock successful Gemini API response
    const mockResponse: GeminiResponse = {
      disease: 'Tomato___Late_blight',
      description: 'A fungal disease affecting tomato plants',
      symptoms: ['Brown spots on leaves', 'Wilting', 'Fruit rot'],
      treatment: 'Apply copper-based fungicide',
      pesticides: [
        { name: 'Copper Fungicide', buyLink: 'https://example.com/copper' }
      ],
      organicSolutions: ['Remove infected leaves', 'Improve air circulation']
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify(mockResponse)
                }
              ]
            }
          }
        ]
      })
    });

    global.fetch = mockFetch;

    // Call the function
    const result = await callGeminiAPI('Tomato___Late_blight', 'en');

    // Verify fetch was called with correct URL and parameters
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const fetchCall = mockFetch.mock.calls[0];
    expect(fetchCall[0]).toContain('generativelanguage.googleapis.com');
    expect(fetchCall[0]).toContain('gemini-1.5-flash');
    expect(fetchCall[0]).toContain('key=test-api-key');

    // Verify request body
    const requestInit = fetchCall[1] as RequestInit;
    expect(requestInit.method).toBe('POST');
    expect(requestInit.headers).toEqual({ 'Content-Type': 'application/json' });
    
    const requestBody = JSON.parse(requestInit.body as string);
    expect(requestBody.contents).toBeDefined();
    expect(requestBody.contents[0].parts[0].text).toContain('Tomato___Late_blight');
    expect(requestBody.contents[0].parts[0].text).toContain('English');

    // Verify result
    expect(result).toEqual(mockResponse);
  });

  it('should handle JSON response wrapped in markdown code blocks', async () => {
    const mockResponse: GeminiResponse = {
      disease: 'Potato___Early_blight',
      description: 'A fungal disease',
      symptoms: ['Leaf spots'],
      treatment: 'Apply fungicide',
      pesticides: [],
      organicSolutions: ['Crop rotation']
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: '```json\n' + JSON.stringify(mockResponse) + '\n```'
                }
              ]
            }
          }
        ]
      })
    });

    global.fetch = mockFetch;

    const result = await callGeminiAPI('Potato___Early_blight', 'en');

    expect(result).toEqual(mockResponse);
  });

  it('should handle JSON parsing errors gracefully with fallback', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: 'This is not valid JSON'
                }
              ]
            }
          }
        ]
      })
    });

    global.fetch = mockFetch;

    const result = await callGeminiAPI('Tomato___Healthy', 'en');

    // Should return fallback structure
    expect(result.disease).toBe('Tomato___Healthy');
    expect(result.description).toContain('Unable to retrieve');
    expect(result.symptoms).toHaveLength(1);
    expect(result.treatment).toBeDefined();
    expect(result.pesticides).toEqual([]);
    expect(result.organicSolutions).toHaveLength(1);
  });

  it('should handle timeout errors', async () => {
    const mockFetch = vi.fn().mockImplementation(() => {
      return new Promise((_, reject) => {
        setTimeout(() => {
          const error = new Error('Aborted');
          error.name = 'AbortError';
          reject(error);
        }, 100);
      });
    });

    global.fetch = mockFetch;

    await expect(callGeminiAPI('Tomato___Late_blight', 'en')).rejects.toThrow(
      'Request timed out'
    );
  });

  it('should handle authentication errors (401)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' })
    });

    global.fetch = mockFetch;

    await expect(callGeminiAPI('Tomato___Late_blight', 'en')).rejects.toThrow(
      'Authentication error'
    );
  });

  it('should handle rate limiting errors (429)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Too many requests' })
    });

    global.fetch = mockFetch;

    await expect(callGeminiAPI('Tomato___Late_blight', 'en')).rejects.toThrow(
      'Too many requests'
    );
  });

  it('should handle invalid request errors (400)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad request' })
    });

    global.fetch = mockFetch;

    await expect(callGeminiAPI('Tomato___Late_blight', 'en')).rejects.toThrow(
      'Invalid request'
    );
  });

  it('should validate empty disease name input', async () => {
    await expect(callGeminiAPI('', 'en')).rejects.toThrow(
      'Disease name cannot be empty'
    );
  });

  it('should validate missing API key', async () => {
    // Explicitly set API key to empty string
    vi.stubEnv('VITE_GEMINI_API_KEY', '');

    await expect(callGeminiAPI('Tomato___Late_blight', 'en')).rejects.toThrow(
      'Gemini API key not configured'
    );
  });

  it('should support Hindi language', async () => {
    const mockResponse: GeminiResponse = {
      disease: 'टमाटर___देर_से_झुलसा',
      description: 'एक कवक रोग',
      symptoms: ['पत्तियों पर भूरे धब्बे'],
      treatment: 'तांबा आधारित फफूंदनाशक लगाएं',
      pesticides: [],
      organicSolutions: ['संक्रमित पत्तियों को हटा दें']
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify(mockResponse)
                }
              ]
            }
          }
        ]
      })
    });

    global.fetch = mockFetch;

    const result = await callGeminiAPI('Tomato___Late_blight', 'hi');

    // Verify request includes Hindi language instruction
    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(requestBody.contents[0].parts[0].text).toContain('Hindi');
    expect(requestBody.contents[0].parts[0].text).toContain('हिंदी');

    expect(result).toEqual(mockResponse);
  });

  it('should support Telugu language', async () => {
    const mockResponse: GeminiResponse = {
      disease: 'టమాటా___లేట్_బ్లైట్',
      description: 'ఒక శిలీంద్ర వ్యాధి',
      symptoms: ['ఆకులపై గోధుమ మచ్చలు'],
      treatment: 'రాగి ఆధారిత శిలీంద్ర నాశిని వర్తించండి',
      pesticides: [],
      organicSolutions: ['సోకిన ఆకులను తొలగించండి']
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify(mockResponse)
                }
              ]
            }
          }
        ]
      })
    });

    global.fetch = mockFetch;

    const result = await callGeminiAPI('Tomato___Late_blight', 'te');

    // Verify request includes Telugu language instruction
    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(requestBody.contents[0].parts[0].text).toContain('Telugu');
    expect(requestBody.contents[0].parts[0].text).toContain('తెలుగు');

    expect(result).toEqual(mockResponse);
  });

  it('should handle incomplete response data with fallback', async () => {
    const incompleteResponse = {
      disease: 'Tomato___Late_blight',
      // Missing description, symptoms, treatment, etc.
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify(incompleteResponse)
                }
              ]
            }
          }
        ]
      })
    });

    global.fetch = mockFetch;

    const result = await callGeminiAPI('Tomato___Late_blight', 'en');

    // Should fill in missing fields with fallback values
    expect(result.disease).toBe('Tomato___Late_blight');
    expect(result.description).toBeDefined();
    expect(result.symptoms).toBeDefined();
    expect(result.treatment).toBeDefined();
    expect(result.pesticides).toBeDefined();
    expect(result.organicSolutions).toBeDefined();
  });

  it('should handle network errors', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));

    global.fetch = mockFetch;

    await expect(callGeminiAPI('Tomato___Late_blight', 'en')).rejects.toThrow(
      'Network error'
    );
  });
});
