/**
 * Bug Condition Exploration Test for Disease Detection Unknown Fix
 * 
 * **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * **DO NOT attempt to fix the test or the code when it fails**
 * **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
 * **GOAL**: Surface counterexamples that demonstrate the bug exists
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { callHuggingFaceAPI } from './diseaseService';

describe('Bug Condition Exploration - Disease Detection Returns Unknown Disease', () => {
  // Mock environment variable
  beforeEach(() => {
    vi.stubEnv('VITE_HUGGINGFACE_API_TOKEN', 'test-api-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  /**
   * Property 1: Bug Condition - Disease Detection Returns Unknown Disease
   * 
   * This property tests that the callHuggingFaceAPI function correctly:
   * 1. Parses API responses in both array and object formats
   * 2. Sends images as binary data with Content-Type: application/octet-stream
   * 3. Retries when receiving 503 status (model loading)
   * 4. Converts score values (0-1 range) to confidence percentages (0-100)
   * 5. Logs raw responses and parsed results
   * 
   * **EXPECTED OUTCOME ON UNFIXED CODE**: Test FAILS (this is correct - it proves the bug exists)
   * 
   * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8**
   */
  it('Property 1: Bug Condition - callHuggingFaceAPI should correctly parse responses, send binary data, retry on 503, convert scores, and log results', async () => {
    // Valid base64 image (1x1 red pixel PNG)
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    // Test Case 1: Array Response Format
    // Mock API returning array format [{label: "Disease", score: 0.85}]
    const mockFetchArray = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        { label: 'Tomato___Late_blight', score: 0.85 },
        { label: 'Tomato___Early_blight', score: 0.10 }
      ]
    });
    global.fetch = mockFetchArray;

    const resultArray = await callHuggingFaceAPI(base64Image);

    // Verify response parsing for array format
    expect(resultArray.diseaseName).toBe('Tomato___Late_blight');
    expect(resultArray.diseaseName).not.toBe('Unknown Disease');
    
    // Verify score conversion (0.85 -> 85%)
    expect(resultArray.confidence).toBe(85);
    expect(resultArray.confidence).toBeGreaterThan(0);
    expect(resultArray.confidence).toBeLessThanOrEqual(100);

    // Verify image is sent as binary data with correct Content-Type
    expect(mockFetchArray).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/octet-stream'
        }),
        body: expect.any(Uint8Array)
      })
    );

    // Test Case 2: 503 Retry Behavior
    // Mock API returning 503 status with loading message, then success
    const mockFetch503 = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ error: 'Model is currently loading' })
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [
          { label: 'Potato___Early_blight', score: 0.72 }
        ]
      });
    global.fetch = mockFetch503;

    const result503 = await callHuggingFaceAPI(base64Image);

    // Verify retry logic works
    expect(mockFetch503).toHaveBeenCalledTimes(2);
    expect(result503.diseaseName).toBe('Potato___Early_blight');
    expect(result503.diseaseName).not.toBe('Unknown Disease');
    expect(result503.confidence).toBe(72);

    // Test Case 3: Score Conversion with Various Values
    // Test that scores in 0-1 range are converted to 0-100 percentages
    const testScores = [
      { score: 0.95, expected: 95 },
      { score: 0.7234, expected: 72.3 },
      { score: 0.50, expected: 50 },
      { score: 0.123, expected: 12.3 },
      { score: 1.0, expected: 100 }
    ];

    for (const testCase of testScores) {
      const mockFetchScore = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [
          { label: 'Pepper___Bacterial_spot', score: testCase.score }
        ]
      });
      global.fetch = mockFetchScore;

      const resultScore = await callHuggingFaceAPI(base64Image);

      // Verify score conversion
      expect(resultScore.confidence).toBe(testCase.expected);
      expect(resultScore.confidence).toBeGreaterThanOrEqual(0);
      expect(resultScore.confidence).toBeLessThanOrEqual(100);
    }

    // Test Case 4: Verify Logging
    // Mock console.log to verify logging occurs
    const consoleLogSpy = vi.spyOn(console, 'log');
    
    const mockFetchLog = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        { label: 'Tomato___Healthy', score: 0.88 }
      ]
    });
    global.fetch = mockFetchLog;

    await callHuggingFaceAPI(base64Image);

    // Verify raw responses and parsed results are logged
    expect(consoleLogSpy).toHaveBeenCalled();
    
    // Check for specific log messages
    const logCalls = consoleLogSpy.mock.calls.map(call => call.join(' '));
    const hasRawResponseLog = logCalls.some(log => 
      log.includes('Hugging Face API raw response') || log.includes('raw response')
    );
    const hasParsedResultLog = logCalls.some(log => 
      log.includes('Top prediction') || log.includes('Disease detected successfully')
    );

    expect(hasRawResponseLog).toBe(true);
    expect(hasParsedResultLog).toBe(true);

    consoleLogSpy.mockRestore();
  });

  /**
   * Property-Based Test: Response Parsing for Multiple Disease Types
   * 
   * This property-based test generates random disease names and scores
   * to verify that the function correctly parses responses across many inputs.
   * 
   * **Validates: Requirements 1.2, 1.3, 1.6**
   */
  it('Property-Based: Should correctly parse API responses for various disease types and scores', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random disease names
        fc.constantFrom(
          'Tomato___Late_blight',
          'Tomato___Early_blight',
          'Tomato___Bacterial_spot',
          'Tomato___Healthy',
          'Potato___Late_blight',
          'Potato___Early_blight',
          'Potato___Healthy',
          'Pepper___Bacterial_spot',
          'Pepper___Healthy'
        ),
        // Generate random scores in 0-1 range
        fc.double({ min: 0.1, max: 1.0, noNaN: true }),
        async (diseaseName, score) => {
          // Mock API response
          const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => [
              { label: diseaseName, score: score }
            ]
          });
          global.fetch = mockFetch;

          const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

          const result = await callHuggingFaceAPI(base64Image);

          // Verify disease name is correctly extracted
          expect(result.diseaseName).toBe(diseaseName);
          expect(result.diseaseName).not.toBe('Unknown Disease');

          // Verify confidence is converted correctly (score * 100, rounded to 1 decimal)
          const expectedConfidence = Math.round(score * 1000) / 10;
          expect(result.confidence).toBe(expectedConfidence);
          expect(result.confidence).toBeGreaterThan(0);
          expect(result.confidence).toBeLessThanOrEqual(100);

          // Verify image is sent as binary data
          expect(mockFetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
              body: expect.any(Uint8Array)
            })
          );
        }
      ),
      { numRuns: 20 } // Run 20 test cases
    );
  });
});
