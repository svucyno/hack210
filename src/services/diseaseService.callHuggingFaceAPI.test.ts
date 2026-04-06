/**
 * Unit tests for callHuggingFaceAPI function
 * Tests the Hugging Face API integration helper
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callHuggingFaceAPI } from './diseaseService';

describe('callHuggingFaceAPI', () => {
  // Mock environment variable
  beforeEach(() => {
    vi.stubEnv('VITE_HUGGINGFACE_API_TOKEN', 'test-api-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('should make direct HTTP call to Hugging Face API', async () => {
    // Mock fetch
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        { label: 'Tomato___Late_blight', score: 0.95 },
        { label: 'Tomato___Early_blight', score: 0.03 }
      ]
    });
    global.fetch = mockFetch;

    // Valid base64 image (1x1 red pixel PNG)
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    const result = await callHuggingFaceAPI(base64Image);

    // Verify fetch was called with correct parameters
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api-inference.huggingface.co/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/octet-stream'
        })
      })
    );

    // Verify result
    expect(result).toEqual({
      diseaseName: 'Tomato___Late_blight',
      confidence: 95
    });
  });

  it('should extract base64 data from data URL format', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ label: 'Tomato___Healthy', score: 0.88 }]
    });
    global.fetch = mockFetch;

    const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';

    await callHuggingFaceAPI(base64Image);

    // Verify that body contains binary data (Uint8Array)
    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[1].body).toBeInstanceOf(Uint8Array);
  });

  it('should convert confidence score from 0-1 to 0-100', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [{ label: 'Potato___Late_blight', score: 0.7234 }]
    });
    global.fetch = mockFetch;

    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    const result = await callHuggingFaceAPI(base64Image);

    expect(result.confidence).toBe(72.3); // 0.7234 * 100 = 72.34, rounded to 72.3 (1 decimal place)
  });

  it('should handle model loading status with retry logic', async () => {
    // First call returns 503 (model loading)
    // Second call returns success
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ error: 'Model is currently loading' })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [{ label: 'Pepper___Bacterial_spot', score: 0.91 }]
      });
    global.fetch = mockFetch;

    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    const result = await callHuggingFaceAPI(base64Image);

    // Should have retried
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      diseaseName: 'Pepper___Bacterial_spot',
      confidence: 91
    });
  });

  it('should throw error for invalid base64 format', async () => {
    const invalidImage = 'not-a-valid-base64-image';

    await expect(callHuggingFaceAPI(invalidImage)).rejects.toThrow(
      'Invalid image format. Expected Base64 data URL.'
    );
  });

  it('should throw error for empty image data', async () => {
    await expect(callHuggingFaceAPI('')).rejects.toThrow(
      'Image data cannot be empty'
    );
  });

  it('should throw error when API key is not configured', async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_HUGGINGFACE_API_TOKEN', '');

    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    await expect(callHuggingFaceAPI(base64Image)).rejects.toThrow(
      'Hugging Face API key not configured'
    );
  });

  it('should handle authentication errors (401/403)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid API key' })
    });
    global.fetch = mockFetch;

    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    await expect(callHuggingFaceAPI(base64Image)).rejects.toThrow(
      'Authentication error. Please check your Hugging Face API key.'
    );
  });

  it('should handle rate limiting (429)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Rate limit exceeded' })
    });
    global.fetch = mockFetch;

    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    await expect(callHuggingFaceAPI(base64Image)).rejects.toThrow(
      'Too many requests. Please wait a moment and try again.'
    );
  });

  it('should handle timeout with 30 second limit', async () => {
    // Mock fetch that simulates abort
    const mockFetch = vi.fn().mockImplementation(() => {
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      return Promise.reject(error);
    });
    global.fetch = mockFetch;

    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    // Should timeout
    await expect(callHuggingFaceAPI(base64Image)).rejects.toThrow(
      'Request timed out. Please try again.'
    );
  });

  it('should handle invalid API response format', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [] // Empty array
    });
    global.fetch = mockFetch;

    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    await expect(callHuggingFaceAPI(base64Image)).rejects.toThrow(
      'Invalid API response format'
    );
  });

  it('should handle network errors', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('fetch failed'));
    global.fetch = mockFetch;

    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    await expect(callHuggingFaceAPI(base64Image)).rejects.toThrow(
      'Network error. Please check your connection and try again.'
    );
  });
});
