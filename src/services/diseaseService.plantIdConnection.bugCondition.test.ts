/**
 * Bug Condition Exploration Test for Plant.id Connection Fix
 * 
 * **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * **DO NOT attempt to fix the test or the code when it fails**
 * **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
 * **GOAL**: Surface counterexamples that demonstrate the bug exists
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { detectDisease } from './diseaseService';

describe('Bug Condition Exploration - Plant.id Connection Misleading Error Messages', () => {
  // Valid base64 image (1x1 red pixel PNG)
  const validBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  /**
   * Property 1: Bug Condition - Invalid Plant.id API Key + Missing PlantNet Key
   * 
   * WHEN Plant.id API fails with 401 (invalid API key) AND PlantNet API key is not configured
   * THEN the system should throw error mentioning "API key" and ".env file"
   * 
   * **EXPECTED OUTCOME ON UNFIXED CODE**: Test FAILS because error message is generic
   * "Unable to connect to plant identification services" instead of specific
   * "Plant.id API key is invalid or missing. PlantNet fallback is not configured."
   * 
   * **Validates: Requirements 1.1, 2.1**
   */
  it('Property 1: Bug Condition - Should throw specific error when Plant.id fails with 401 and PlantNet key is missing', async () => {
    // Mock environment: Plant.id key exists but is invalid, PlantNet key missing
    vi.stubEnv('VITE_PLANT_ID_API_KEY', 'invalid-key-12345');
    vi.stubEnv('VITE_PLANTNET_API_KEY', ''); // Missing PlantNet key

    // Mock Plant.id API returning 401 (invalid API key)
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: 'Invalid API key' })
    });
    global.fetch = mockFetch;

    // Execute detectDisease and expect it to throw
    await expect(detectDisease(validBase64Image, 'en')).rejects.toThrow();

    // Capture the error
    try {
      await detectDisease(validBase64Image, 'en');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // EXPECTED BEHAVIOR: Error should mention "API key" OR "authentication"
      const mentionsApiKey = errorMessage.toLowerCase().includes('api key') || 
                            errorMessage.toLowerCase().includes('authentication');
      
      // EXPECTED BEHAVIOR: Error should mention ".env" OR "configuration"
      const mentionsConfiguration = errorMessage.toLowerCase().includes('.env') || 
                                    errorMessage.toLowerCase().includes('configuration') ||
                                    errorMessage.toLowerCase().includes('configured');
      
      // EXPECTED BEHAVIOR: Error should mention "PlantNet" OR "fallback"
      const mentionsFallback = errorMessage.toLowerCase().includes('plantnet') || 
                              errorMessage.toLowerCase().includes('fallback');
      
      // These assertions will FAIL on unfixed code (proving the bug exists)
      expect(mentionsApiKey).toBe(true);
      expect(mentionsConfiguration).toBe(true);
      expect(mentionsFallback).toBe(true);
      
      // BUGGY BEHAVIOR: Error is generic "Unable to connect"
      const isGenericError = errorMessage.toLowerCase().includes('unable to connect') &&
                            !mentionsApiKey;
      
      // This assertion documents the bug (will be true on unfixed code)
      expect(isGenericError).toBe(false);
    }
  });

  /**
   * Property 2: Bug Condition - Plant.id Timeout + Missing PlantNet Key
   * 
   * WHEN Plant.id API times out AND PlantNet API key is not configured
   * THEN the system should throw error mentioning "timeout" and "PlantNet fallback is not configured"
   * 
   * **EXPECTED OUTCOME ON UNFIXED CODE**: Test FAILS because error message is generic
   * 
   * **Validates: Requirements 1.2, 2.2**
   */
  it('Property 2: Bug Condition - Should throw specific error when Plant.id times out and PlantNet key is missing', async () => {
    // Mock environment: Plant.id key exists, PlantNet key missing
    vi.stubEnv('VITE_PLANT_ID_API_KEY', 'valid-key-12345');
    vi.stubEnv('VITE_PLANTNET_API_KEY', ''); // Missing PlantNet key

    // Mock Plant.id API timing out (AbortError)
    const mockFetch = vi.fn().mockRejectedValue(
      Object.assign(new Error('The operation was aborted'), { name: 'AbortError' })
    );
    global.fetch = mockFetch;

    // Execute detectDisease and expect it to throw
    await expect(detectDisease(validBase64Image, 'en')).rejects.toThrow();

    // Capture the error
    try {
      await detectDisease(validBase64Image, 'en');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // EXPECTED BEHAVIOR: Error should mention "timeout" OR "unavailable"
      const mentionsTimeout = errorMessage.toLowerCase().includes('timeout') || 
                             errorMessage.toLowerCase().includes('unavailable');
      
      // EXPECTED BEHAVIOR: Error should mention "PlantNet" OR "fallback"
      const mentionsFallback = errorMessage.toLowerCase().includes('plantnet') || 
                              errorMessage.toLowerCase().includes('fallback');
      
      // EXPECTED BEHAVIOR: Error should provide actionable guidance
      const hasActionableGuidance = errorMessage.toLowerCase().includes('set') ||
                                   errorMessage.toLowerCase().includes('configure') ||
                                   errorMessage.toLowerCase().includes('try again');
      
      // These assertions will FAIL on unfixed code (proving the bug exists)
      expect(mentionsTimeout).toBe(true);
      expect(mentionsFallback).toBe(true);
      expect(hasActionableGuidance).toBe(true);
      
      // BUGGY BEHAVIOR: Error is generic "Unable to connect"
      const isGenericError = errorMessage.toLowerCase().includes('unable to connect') &&
                            !mentionsTimeout;
      
      expect(isGenericError).toBe(false);
    }
  });

  /**
   * Property 3: Bug Condition - Both APIs Fail with Authentication Errors
   * 
   * WHEN Plant.id API fails with 401 AND PlantNet API also fails with authentication error
   * THEN the system should throw error mentioning both APIs and authentication failure
   * 
   * **EXPECTED OUTCOME ON UNFIXED CODE**: Test FAILS because error message is generic
   * 
   * **Validates: Requirements 1.3, 2.3**
   */
  it('Property 3: Bug Condition - Should throw specific error when both APIs fail with authentication errors', async () => {
    // Mock environment: Both API keys exist but are invalid
    vi.stubEnv('VITE_PLANT_ID_API_KEY', 'invalid-plantid-key');
    vi.stubEnv('VITE_PLANTNET_API_KEY', 'invalid-plantnet-key');

    // Mock both APIs returning 401 (need 4 responses for 2 detectDisease calls)
    const mockFetch = vi.fn()
      .mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Invalid API key' })
      });
    global.fetch = mockFetch;

    // Capture the error
    try {
      await detectDisease(validBase64Image, 'en');
      // If no error is thrown, fail the test
      expect(true).toBe(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // EXPECTED BEHAVIOR: Error should mention "authentication" OR "API key"
      const mentionsAuth = errorMessage.toLowerCase().includes('authentication') || 
                          errorMessage.toLowerCase().includes('api key');
      
      // EXPECTED BEHAVIOR: Error should mention both APIs OR "both"
      const mentionsBothApis = (errorMessage.toLowerCase().includes('plant.id') && 
                               errorMessage.toLowerCase().includes('plantnet')) ||
                              errorMessage.toLowerCase().includes('both');
      
      // EXPECTED BEHAVIOR: Error should provide actionable guidance
      const hasActionableGuidance = errorMessage.toLowerCase().includes('check') ||
                                   errorMessage.toLowerCase().includes('verify');
      
      // These assertions will FAIL on unfixed code (proving the bug exists)
      expect(mentionsAuth).toBe(true);
      expect(mentionsBothApis).toBe(true);
      expect(hasActionableGuidance).toBe(true);
      
      // BUGGY BEHAVIOR: Error is generic "Unable to connect"
      const isGenericError = errorMessage.toLowerCase().includes('unable to connect') &&
                            !mentionsAuth;
      
      expect(isGenericError).toBe(false);
    }
  });

  /**
   * Property 4: Preservation - Actual Network Connectivity Failure
   * 
   * WHEN both APIs fail due to actual network connectivity issues (both timeout)
   * THEN the system SHOULD throw generic "Unable to connect" error (this is correct)
   * 
   * This test verifies that the fix doesn't break the correct behavior for actual network issues.
   * 
   * **EXPECTED OUTCOME**: Test PASSES on both unfixed and fixed code
   * 
   * **Validates: Requirements 2.4, 3.1**
   */
  it('Property 4: Preservation - Should throw generic error for actual network connectivity failure', async () => {
    // Mock environment: Both API keys exist
    vi.stubEnv('VITE_PLANT_ID_API_KEY', 'valid-plantid-key');
    vi.stubEnv('VITE_PLANTNET_API_KEY', 'valid-plantnet-key');

    // Mock both APIs timing out (actual network issue) - use mockRejectedValue for all calls
    const mockFetch = vi.fn()
      .mockRejectedValue(
        Object.assign(new Error('The operation was aborted'), { name: 'AbortError' })
      );
    global.fetch = mockFetch;

    // Capture the error
    try {
      await detectDisease(validBase64Image, 'en');
      // If no error is thrown, fail the test
      expect(true).toBe(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // EXPECTED BEHAVIOR: For actual network issues, generic error is acceptable
      const mentionsConnection = errorMessage.toLowerCase().includes('connection') || 
                                errorMessage.toLowerCase().includes('unable to connect');
      
      // This should pass on both unfixed and fixed code
      expect(mentionsConnection).toBe(true);
    }
  });

  /**
   * Property-Based Test: Various API Failure Scenarios
   * 
   * This property-based test generates random API failure scenarios
   * to verify that error messages are always specific and actionable.
   * 
   * **EXPECTED OUTCOME ON UNFIXED CODE**: Test FAILS for configuration errors
   * 
   * **Validates: Requirements 2.1, 2.2, 2.3**
   */
  it('Property-Based: Should provide specific error messages for various API failure scenarios', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random HTTP error status codes
        fc.constantFrom(401, 403, 429, 500, 503),
        // Generate random PlantNet key availability
        fc.boolean(),
        async (statusCode, hasPlantNetKey) => {
          // Mock environment
          vi.stubEnv('VITE_PLANT_ID_API_KEY', 'test-key');
          vi.stubEnv('VITE_PLANTNET_API_KEY', hasPlantNetKey ? 'plantnet-key' : '');

          // Mock Plant.id API returning error status
          const mockFetch = vi.fn().mockResolvedValue({
            ok: false,
            status: statusCode,
            statusText: 'Error',
            json: async () => ({ error: 'API Error' })
          });
          global.fetch = mockFetch;

          // Execute detectDisease and expect it to throw
          try {
            await detectDisease(validBase64Image, 'en');
            // If no error is thrown, fail the test
            expect(true).toBe(false);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            
            // For authentication errors (401, 403), error should mention API key or authentication
            if (statusCode === 401 || statusCode === 403) {
              const mentionsAuth = errorMessage.toLowerCase().includes('api key') || 
                                  errorMessage.toLowerCase().includes('authentication');
              
              // This will FAIL on unfixed code for auth errors
              expect(mentionsAuth).toBe(true);
            }
            
            // For rate limit errors (429), error should mention rate limit
            if (statusCode === 429) {
              const mentionsRateLimit = errorMessage.toLowerCase().includes('rate limit');
              
              // This will FAIL on unfixed code for rate limit errors
              expect(mentionsRateLimit).toBe(true);
            }
            
            // For server errors (500, 503), error should mention service unavailability
            if (statusCode >= 500) {
              const mentionsUnavailable = errorMessage.toLowerCase().includes('unavailable') ||
                                         errorMessage.toLowerCase().includes('temporarily');
              
              // This will FAIL on unfixed code for server errors
              expect(mentionsUnavailable).toBe(true);
            }
            
            // Error should always provide some actionable guidance
            const hasActionableGuidance = errorMessage.toLowerCase().includes('check') ||
                                         errorMessage.toLowerCase().includes('try') ||
                                         errorMessage.toLowerCase().includes('wait') ||
                                         errorMessage.toLowerCase().includes('set') ||
                                         errorMessage.toLowerCase().includes('configure');
            
            expect(hasActionableGuidance).toBe(true);
          }
        }
      ),
      { numRuns: 10 } // Run 10 test cases
    );
  });
});
