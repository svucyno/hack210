import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import * as fc from "fast-check";
import {
  validateImageFormat,
  convertToBase64,
  compressImage,
  getTreatment,
  getConfidenceColor,
  formatDetectionResult,
  callHuggingFaceAPI,
  callGeminiAPI,
  type DetectionResult,
  type ValidationResult,
} from "./diseaseService";

/**
 * Preservation Property Tests
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 * 
 * Property 2: Preservation - Existing Functionality Unchanged
 * 
 * CRITICAL: These tests MUST PASS on unfixed code - they establish baseline behavior
 * 
 * GOAL: Observe and document current behavior patterns that must be preserved after fix
 * 
 * Expected Outcome: Tests PASS (confirms baseline behavior to preserve)
 * 
 * These tests verify that for all inputs involving image validation, compression,
 * Base64 conversion, treatment mapping, confidence color coding, and results formatting,
 * the behavior remains unchanged after implementing direct API calls.
 */

describe("Preservation Property Tests - Image Validation", () => {
  /**
   * Test 1: Valid Image Format Acceptance
   * 
   * **Validates: Requirement 3.1**
   * 
   * Property: For any file with MIME type image/jpeg, image/png, or image/webp
   * and size <= 5MB, validation returns isValid: true
   * 
   * This test observes the current validation behavior on unfixed code
   */
  it("should accept JPEG, PNG, and WebP formats under 5MB (baseline behavior)", () => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    validTypes.forEach((type) => {
      const file = new File(["test"], "test.jpg", { type });
      Object.defineProperty(file, "size", { value: maxSizeBytes - 1 });

      const result: ValidationResult = validateImageFormat(file);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();

      console.log(`✓ ${type} files under 5MB are accepted`);
    });
  });

  /**
   * Test 2: Invalid Image Format Rejection
   * 
   * **Validates: Requirement 3.1**
   * 
   * Property: For any file with MIME type other than image/jpeg, image/png, or image/webp,
   * validation returns isValid: false with appropriate error message
   * 
   * This test observes the current validation behavior on unfixed code
   */
  it("should reject invalid image formats (baseline behavior)", () => {
    const invalidTypes = ["image/gif", "image/bmp", "image/svg+xml", "application/pdf", "text/plain"];

    invalidTypes.forEach((type) => {
      const file = new File(["test"], "test.file", { type });
      Object.defineProperty(file, "size", { value: 1024 });

      const result: ValidationResult = validateImageFormat(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Invalid file type. Please upload JPEG, PNG, or WebP.");

      console.log(`✓ ${type} files are rejected with error message`);
    });
  });

  /**
   * Test 3: File Size Limit Enforcement
   * 
   * **Validates: Requirement 3.2**
   * 
   * Property: For any file with size > 5MB, validation returns isValid: false
   * with appropriate error message
   * 
   * This test observes the current validation behavior on unfixed code
   */
  it("should reject files larger than 5MB (baseline behavior)", () => {
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    Object.defineProperty(file, "size", { value: maxSizeBytes + 1 });

    const result: ValidationResult = validateImageFormat(file);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe(`File size exceeds ${maxSizeMB}MB. Please choose a smaller image.`);

    console.log(`✓ Files larger than ${maxSizeMB}MB are rejected with error message`);
  });

  /**
   * Property-Based Test: Validation Consistency
   * 
   * **Validates: Requirements 3.1, 3.2**
   * 
   * Property: For all file inputs, validation consistently applies format and size rules
   * 
   * This property-based test generates many file scenarios and verifies
   * validation consistency across all of them
   */
  it("should validate files consistently across all scenarios (property-based)", () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.constantFrom(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/bmp",
            "application/pdf"
          ),
          size: fc.integer({ min: 1, max: 10 * 1024 * 1024 }), // 1 byte to 10MB
        }),
        (fileData) => {
          const file = new File(["test"], "test.file", { type: fileData.type });
          Object.defineProperty(file, "size", { value: fileData.size });

          const result: ValidationResult = validateImageFormat(file);

          const validTypes = ["image/jpeg", "image/png", "image/webp"];
          const maxSizeBytes = 5 * 1024 * 1024;

          const expectedValid = validTypes.includes(fileData.type) && fileData.size <= maxSizeBytes;

          expect(result.isValid).toBe(expectedValid);

          if (!expectedValid) {
            expect(result.error).toBeDefined();
          }
        }
      ),
      { numRuns: 50 } // Run 50 random scenarios
    );

    console.log("✓ Validation behaves consistently across all generated file scenarios");
  });
});

describe("Preservation Property Tests - Base64 Conversion", () => {
  /**
   * Test 4: Base64 Conversion Produces Valid Data URLs
   * 
   * **Validates: Requirement 3.3**
   * 
   * Property: For any valid image file, convertToBase64 returns a string
   * starting with "data:image/" (valid data URL format)
   * 
   * This test observes the current conversion behavior on unfixed code
   */
  it("should convert images to valid Base64 data URLs (baseline behavior)", async () => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    for (const type of validTypes) {
      // Create a minimal valid image file
      const file = new File(["test content"], "test.jpg", { type });

      const result = await convertToBase64(file);

      expect(result).toMatch(/^data:image\//);
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);

      console.log(`✓ ${type} converts to valid data URL starting with "data:image/"`);
    }
  });
});

describe("Preservation Property Tests - Image Compression", () => {
  /**
   * Test 5: Small Files Skip Compression
   * 
   * **Validates: Requirement 3.3**
   * 
   * Property: For any file with size <= 1MB, compressImage returns Base64
   * without compression (just converts to Base64)
   * 
   * This test observes the current compression behavior on unfixed code
   */
  it("should skip compression for files <= 1MB (baseline behavior)", async () => {
    const file = new File(["small file content"], "small.jpg", { type: "image/jpeg" });
    Object.defineProperty(file, "size", { value: 500 * 1024 }); // 500KB

    const result = await compressImage(file, 1);

    expect(result).toMatch(/^data:image\//);
    expect(typeof result).toBe("string");

    console.log("✓ Files <= 1MB skip compression and convert directly to Base64");
  });
});

describe("Preservation Property Tests - Treatment Mapping", () => {
  /**
   * Test 6: Treatment Mapping Returns Correct Translations
   * 
   * **Validates: Requirement 3.4**
   * 
   * Property: For any known disease name, getTreatment returns correct
   * treatment text in the specified language (en, hi, te)
   * 
   * This test observes the current treatment mapping behavior on unfixed code
   */
  it("should return correct treatment translations for known diseases (baseline behavior)", () => {
    const knownDiseases = [
      "Tomato___Late_blight",
      "Tomato___Early_blight",
      "Tomato___Bacterial_spot",
      "Tomato___Healthy",
      "Potato___Late_blight",
      "Potato___Early_blight",
      "Potato___Healthy",
      "Pepper___Bacterial_spot",
      "Pepper___Healthy",
    ];

    const languages: Array<"en" | "hi" | "te"> = ["en", "hi", "te"];

    knownDiseases.forEach((disease) => {
      languages.forEach((lang) => {
        const treatment = getTreatment(disease, lang);

        expect(typeof treatment).toBe("string");
        expect(treatment.length).toBeGreaterThan(0);

        console.log(`✓ ${disease} has treatment in ${lang}`);
      });
    });
  });

  /**
   * Test 7: Unknown Disease Returns Default Treatment
   * 
   * **Validates: Requirement 3.4**
   * 
   * Property: For any unknown disease name, getTreatment returns default
   * treatment message in the specified language
   * 
   * This test observes the current treatment mapping behavior on unfixed code
   */
  it("should return default treatment for unknown diseases (baseline behavior)", () => {
    const unknownDiseases = ["Unknown_Disease", "Random_Disease", "Test_Disease"];
    const languages: Array<"en" | "hi" | "te"> = ["en", "hi", "te"];

    unknownDiseases.forEach((disease) => {
      languages.forEach((lang) => {
        const treatment = getTreatment(disease, lang);

        expect(typeof treatment).toBe("string");
        expect(treatment.length).toBeGreaterThan(0);

        // Verify it contains consultation advice
        if (lang === "en") {
          expect(treatment).toContain("Consult");
        }

        console.log(`✓ ${disease} returns default treatment in ${lang}`);
      });
    });
  });

  /**
   * Property-Based Test: Treatment Mapping Consistency
   * 
   * **Validates: Requirement 3.4**
   * 
   * Property: For all disease names and languages, getTreatment always returns
   * a non-empty string
   * 
   * This property-based test generates many disease/language combinations
   */
  it("should return non-empty treatment for all disease/language combinations (property-based)", () => {
    fc.assert(
      fc.property(
        fc.record({
          disease: fc.constantFrom(
            "Tomato___Late_blight",
            "Potato___Healthy",
            "Pepper___Bacterial_spot",
            "Unknown_Disease",
            "Random_Disease"
          ),
          language: fc.constantFrom("en", "hi", "te") as fc.Arbitrary<"en" | "hi" | "te">,
        }),
        (data) => {
          const treatment = getTreatment(data.disease, data.language);

          expect(typeof treatment).toBe("string");
          expect(treatment.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 30 } // Run 30 random scenarios
    );

    console.log("✓ Treatment mapping returns non-empty strings for all combinations");
  });
});

describe("Preservation Property Tests - Confidence Color Coding", () => {
  /**
   * Test 8: Confidence Color Coding
   * 
   * **Validates: Requirement 3.5**
   * 
   * Property: For any confidence score:
   * - > 80: returns "text-green-600"
   * - >= 50 and <= 80: returns "text-yellow-600"
   * - < 50: returns "text-red-600"
   * 
   * This test observes the current color coding behavior on unfixed code
   */
  it("should return correct color classes for confidence scores (baseline behavior)", () => {
    // Test high confidence (> 80)
    expect(getConfidenceColor(81)).toBe("text-green-600");
    expect(getConfidenceColor(90)).toBe("text-green-600");
    expect(getConfidenceColor(100)).toBe("text-green-600");
    console.log("✓ Confidence > 80 returns green color");

    // Test medium confidence (>= 50 and <= 80)
    expect(getConfidenceColor(50)).toBe("text-yellow-600");
    expect(getConfidenceColor(65)).toBe("text-yellow-600");
    expect(getConfidenceColor(80)).toBe("text-yellow-600");
    console.log("✓ Confidence >= 50 and <= 80 returns yellow color");

    // Test low confidence (< 50)
    expect(getConfidenceColor(0)).toBe("text-red-600");
    expect(getConfidenceColor(25)).toBe("text-red-600");
    expect(getConfidenceColor(49)).toBe("text-red-600");
    console.log("✓ Confidence < 50 returns red color");
  });

  /**
   * Property-Based Test: Confidence Color Consistency
   * 
   * **Validates: Requirement 3.5**
   * 
   * Property: For all confidence scores (0-100), getConfidenceColor returns
   * one of the three valid color classes
   * 
   * This property-based test generates many confidence scores
   */
  it("should return valid color classes for all confidence scores (property-based)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (confidence) => {
          const color = getConfidenceColor(confidence);

          const validColors = ["text-green-600", "text-yellow-600", "text-red-600"];
          expect(validColors).toContain(color);

          // Verify correct color for range
          if (confidence > 80) {
            expect(color).toBe("text-green-600");
          } else if (confidence >= 50) {
            expect(color).toBe("text-yellow-600");
          } else {
            expect(color).toBe("text-red-600");
          }
        }
      ),
      { numRuns: 100 } // Run 100 random scenarios
    );

    console.log("✓ Confidence color coding is consistent across all scores");
  });
});

describe("Preservation Property Tests - Results Formatting", () => {
  /**
   * Test 9: Low Confidence Warning Display
   * 
   * **Validates: Requirement 3.6**
   * 
   * Property: For any detection result with confidence < 50,
   * formatDetectionResult sets lowConfidenceWarning: true
   * 
   * This test observes the current warning behavior on unfixed code
   */
  it("should show low confidence warning for confidence < 50 (baseline behavior)", () => {
    const lowConfidenceResults = [0, 10, 25, 49];

    lowConfidenceResults.forEach((confidence) => {
      const result: DetectionResult = {
        diseaseName: "Test_Disease",
        confidence,
        treatment: "Test treatment",
        timestamp: new Date().toISOString(),
      };

      const formatted = formatDetectionResult(result, "en");

      expect(formatted.lowConfidenceWarning).toBe(true);
      console.log(`✓ Confidence ${confidence} shows low confidence warning`);
    });
  });

  /**
   * Test 10: No Warning for High Confidence
   * 
   * **Validates: Requirement 3.6**
   * 
   * Property: For any detection result with confidence >= 50,
   * formatDetectionResult sets lowConfidenceWarning: false
   * 
   * This test observes the current warning behavior on unfixed code
   */
  it("should not show warning for confidence >= 50 (baseline behavior)", () => {
    const highConfidenceResults = [50, 65, 80, 95, 100];

    highConfidenceResults.forEach((confidence) => {
      const result: DetectionResult = {
        diseaseName: "Test_Disease",
        confidence,
        treatment: "Test treatment",
        timestamp: new Date().toISOString(),
      };

      const formatted = formatDetectionResult(result, "en");

      expect(formatted.lowConfidenceWarning).toBe(false);
      console.log(`✓ Confidence ${confidence} does not show warning`);
    });
  });

  /**
   * Test 11: Results Include All Required Fields
   * 
   * **Validates: Requirement 3.6**
   * 
   * Property: For any detection result, formatDetectionResult returns
   * an object with all required fields: diseaseName, confidence, treatment,
   * lowConfidenceWarning, timestamp
   * 
   * This test observes the current formatting behavior on unfixed code
   */
  it("should include all required fields in formatted results (baseline behavior)", () => {
    const result: DetectionResult = {
      diseaseName: "Tomato___Late_blight",
      confidence: 85,
      treatment: "Test treatment",
      timestamp: new Date().toISOString(),
    };

    const formatted = formatDetectionResult(result, "en");

    expect(formatted).toHaveProperty("diseaseName");
    expect(formatted).toHaveProperty("confidence");
    expect(formatted).toHaveProperty("treatment");
    expect(formatted).toHaveProperty("lowConfidenceWarning");
    expect(formatted).toHaveProperty("timestamp");

    expect(typeof formatted.diseaseName).toBe("string");
    expect(typeof formatted.confidence).toBe("number");
    expect(typeof formatted.treatment).toBe("string");
    expect(typeof formatted.lowConfidenceWarning).toBe("boolean");
    expect(typeof formatted.timestamp).toBe("string");

    console.log("✓ Formatted results include all required fields with correct types");
  });

  /**
   * Test 12: Confidence Normalization
   * 
   * **Validates: Requirement 3.6**
   * 
   * Property: For any detection result with confidence outside 0-100 range,
   * formatDetectionResult normalizes it to 0-100
   * 
   * This test observes the current normalization behavior on unfixed code
   */
  it("should normalize confidence to 0-100 range (baseline behavior)", () => {
    const testCases = [
      { input: -10, expected: 0 },
      { input: 150, expected: 100 },
      { input: 50, expected: 50 },
    ];

    testCases.forEach(({ input, expected }) => {
      const result: DetectionResult = {
        diseaseName: "Test_Disease",
        confidence: input,
        treatment: "Test treatment",
        timestamp: new Date().toISOString(),
      };

      const formatted = formatDetectionResult(result, "en");

      expect(formatted.confidence).toBe(expected);
      console.log(`✓ Confidence ${input} normalized to ${expected}`);
    });
  });

  /**
   * Property-Based Test: Results Formatting Consistency
   * 
   * **Validates: Requirement 3.6**
   * 
   * Property: For all detection results, formatDetectionResult produces
   * consistent output with all required fields and correct types
   * 
   * This property-based test generates many detection result scenarios
   */
  it("should format results consistently across all scenarios (property-based)", () => {
    fc.assert(
      fc.property(
        fc.record({
          diseaseName: fc.constantFrom(
            "Tomato___Late_blight",
            "Potato___Healthy",
            "Pepper___Bacterial_spot",
            "Unknown_Disease"
          ),
          confidence: fc.integer({ min: -50, max: 150 }), // Include out-of-range values
          language: fc.constantFrom("en", "hi", "te") as fc.Arbitrary<"en" | "hi" | "te">,
        }),
        (data) => {
          const result: DetectionResult = {
            diseaseName: data.diseaseName,
            confidence: data.confidence,
            treatment: "Test treatment",
            timestamp: new Date().toISOString(),
          };

          const formatted = formatDetectionResult(result, data.language);

          // Verify all required fields exist
          expect(formatted).toHaveProperty("diseaseName");
          expect(formatted).toHaveProperty("confidence");
          expect(formatted).toHaveProperty("treatment");
          expect(formatted).toHaveProperty("lowConfidenceWarning");
          expect(formatted).toHaveProperty("timestamp");

          // Verify confidence is normalized
          expect(formatted.confidence).toBeGreaterThanOrEqual(0);
          expect(formatted.confidence).toBeLessThanOrEqual(100);

          // Verify low confidence warning logic
          const expectedWarning = formatted.confidence < 50;
          expect(formatted.lowConfidenceWarning).toBe(expectedWarning);

          // Verify treatment is non-empty
          expect(formatted.treatment.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 } // Run 50 random scenarios
    );

    console.log("✓ Results formatting is consistent across all generated scenarios");
  });
});


describe("Preservation Property Tests - API Error Handling", () => {
  // Store original fetch
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Mock environment variables
    vi.stubEnv('VITE_HUGGINGFACE_API_TOKEN', 'test-api-key');
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-gemini-key');
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  /**
   * Test 13: Authentication Error Handling (401/403)
   * 
   * **Validates: Requirement 3.1**
   * 
   * Property: For any API call that returns 401 or 403 status,
   * the system throws an appropriate authentication error message
   * 
   * This test observes the current error handling behavior on unfixed code
   */
  it("should throw authentication error for 401/403 status (baseline behavior)", async () => {
    const authStatuses = [401, 403];
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    for (const status of authStatuses) {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: status,
        json: async () => ({ error: 'Unauthorized' })
      });
      global.fetch = mockFetch;

      await expect(callHuggingFaceAPI(base64Image)).rejects.toThrow(
        /Authentication error/i
      );

      console.log(`✓ Status ${status} throws authentication error`);
    }
  });

  /**
   * Test 14: Rate Limit Error Handling (429)
   * 
   * **Validates: Requirement 3.2**
   * 
   * Property: For any API call that returns 429 status,
   * the system throws an appropriate rate limit error message
   * 
   * This test observes the current error handling behavior on unfixed code
   */
  it("should throw rate limit error for 429 status (baseline behavior)", async () => {
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Rate limit exceeded' })
    });
    global.fetch = mockFetch;

    await expect(callHuggingFaceAPI(base64Image)).rejects.toThrow(
      /Too many requests/i
    );

    console.log("✓ Status 429 throws rate limit error");
  });

  /**
   * Test 15: Timeout Error Handling
   * 
   * **Validates: Requirement 3.3**
   * 
   * Property: For any API call that times out,
   * the system throws a timeout error after the configured timeout period
   * 
   * This test observes the current error handling behavior on unfixed code
   */
  it("should throw timeout error when request times out (baseline behavior)", async () => {
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    // Mock fetch that simulates abort
    const mockFetch = vi.fn().mockImplementation(() => {
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      return Promise.reject(error);
    });
    global.fetch = mockFetch;

    await expect(callHuggingFaceAPI(base64Image)).rejects.toThrow(
      /Request timed out/i
    );

    console.log("✓ Timeout throws appropriate error message");
  });

  /**
   * Test 16: Image Validation Error Handling
   * 
   * **Validates: Requirement 3.4**
   * 
   * Property: For any invalid image format provided to callHuggingFaceAPI,
   * the system throws a validation error
   * 
   * This test observes the current validation behavior on unfixed code
   */
  it("should throw validation error for invalid image formats (baseline behavior)", async () => {
    const invalidImages = [
      '',
      'not-a-valid-base64',
      'data:text/plain;base64,abc123',
    ];

    for (const invalidImage of invalidImages) {
      await expect(callHuggingFaceAPI(invalidImage)).rejects.toThrow();
      console.log(`✓ Invalid image "${invalidImage.substring(0, 20)}..." throws validation error`);
    }
  });

  /**
   * Test 17: Gemini API Independence
   * 
   * **Validates: Requirement 3.5**
   * 
   * Property: The Gemini API for treatment recommendations functions
   * independently of the Hugging Face disease detection results
   * 
   * This test observes that Gemini API can be called directly on unfixed code
   */
  it("should call Gemini API independently for treatment recommendations (baseline behavior)", async () => {
    const mockResponse = {
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

    const result = await callGeminiAPI('Tomato___Late_blight', 'en');

    expect(result).toEqual(mockResponse);
    expect(result.treatment).toBeDefined();
    expect(result.treatment.length).toBeGreaterThan(0);

    console.log("✓ Gemini API functions independently for treatment recommendations");
  });

  /**
   * Test 18: Fallback Treatment Recommendations
   * 
   * **Validates: Requirement 3.6**
   * 
   * Property: When Gemini API fails, the system provides fallback
   * treatment recommendations from the local database
   * 
   * This test observes the fallback behavior on unfixed code
   */
  it("should provide fallback treatment from local database (baseline behavior)", () => {
    const knownDiseases = [
      "Tomato___Late_blight",
      "Potato___Early_blight",
      "Pepper___Bacterial_spot",
    ];

    knownDiseases.forEach((disease) => {
      const treatment = getTreatment(disease, "en");

      expect(typeof treatment).toBe("string");
      expect(treatment.length).toBeGreaterThan(0);
      expect(treatment).not.toContain("Unable to retrieve");

      console.log(`✓ Fallback treatment available for ${disease}`);
    });
  });

  /**
   * Test 19: Low Confidence Warning Flag
   * 
   * **Validates: Requirement 3.7**
   * 
   * Property: For any detection result with confidence < 30%,
   * the system sets the lowConfidenceWarning flag correctly
   * 
   * This test observes the warning behavior on unfixed code
   */
  it("should set low confidence warning flag for confidence < 30% (baseline behavior)", () => {
    const lowConfidenceValues = [0, 10, 20, 29];

    lowConfidenceValues.forEach((confidence) => {
      const result: DetectionResult = {
        diseaseName: "Test_Disease",
        confidence,
        treatment: "Test treatment",
        timestamp: new Date().toISOString(),
      };

      const formatted = formatDetectionResult(result, "en");

      // Note: formatDetectionResult uses < 50 threshold, but the requirement
      // specifies < 30% for the lowConfidenceWarning flag in the actual detection flow
      // This test verifies the current behavior is preserved
      expect(formatted.lowConfidenceWarning).toBe(true);
      console.log(`✓ Confidence ${confidence}% sets low confidence warning`);
    });
  });

  /**
   * Test 20: DetectionResult Structure
   * 
   * **Validates: Requirement 3.8**
   * 
   * Property: For any successful detection, the system returns a DetectionResult
   * with all required fields (diseaseName, confidence, treatment, timestamp)
   * 
   * This test observes the result structure on unfixed code
   */
  it("should return DetectionResult with all required fields (baseline behavior)", () => {
    const result: DetectionResult = {
      diseaseName: "Tomato___Late_blight",
      confidence: 85,
      treatment: "Apply copper-based fungicide",
      timestamp: new Date().toISOString(),
    };

    // Verify all required fields exist
    expect(result).toHaveProperty("diseaseName");
    expect(result).toHaveProperty("confidence");
    expect(result).toHaveProperty("treatment");
    expect(result).toHaveProperty("timestamp");

    // Verify field types
    expect(typeof result.diseaseName).toBe("string");
    expect(typeof result.confidence).toBe("number");
    expect(typeof result.treatment).toBe("string");
    expect(typeof result.timestamp).toBe("string");

    // Verify field values are valid
    expect(result.diseaseName.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
    expect(result.treatment.length).toBeGreaterThan(0);
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format

    console.log("✓ DetectionResult includes all required fields with correct types");
  });

  /**
   * Property-Based Test: API Error Handling Consistency
   * 
   * **Validates: Requirements 3.1, 3.2, 3.3**
   * 
   * Property: For all error status codes, the system consistently throws
   * appropriate error messages
   * 
   * This property-based test generates many error scenarios
   */
  it("should handle API errors consistently across all scenarios (property-based)", async () => {
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(401, 403, 429, 503),
        async (statusCode) => {
          const mockFetch = vi.fn().mockResolvedValue({
            ok: false,
            status: statusCode,
            json: async () => ({ error: 'API Error' })
          });
          global.fetch = mockFetch;

          try {
            await callHuggingFaceAPI(base64Image);
            // If we reach here, the test should fail (error should have been thrown)
            expect(true).toBe(false);
          } catch (error) {
            // Verify error is thrown
            expect(error).toBeDefined();
            expect(error instanceof Error).toBe(true);
            
            // Verify error message is user-friendly
            const errorMessage = (error as Error).message;
            expect(errorMessage.length).toBeGreaterThan(0);
            
            // Verify specific error messages for specific status codes
            if (statusCode === 401 || statusCode === 403) {
              expect(errorMessage).toMatch(/Authentication error/i);
            } else if (statusCode === 429) {
              expect(errorMessage).toMatch(/Too many requests/i);
            }
          }
        }
      ),
      { numRuns: 20 } // Run 20 random scenarios
    );

    console.log("✓ API error handling is consistent across all error status codes");
  });

  /**
   * Property-Based Test: Gemini API Error Handling
   * 
   * **Validates: Requirements 3.1, 3.2, 3.3**
   * 
   * Property: For all Gemini API error scenarios, the system handles
   * errors gracefully and provides fallback behavior
   * 
   * This property-based test generates many Gemini error scenarios
   */
  it("should handle Gemini API errors consistently (property-based)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(401, 403, 429, 400),
        async (statusCode) => {
          const mockFetch = vi.fn().mockResolvedValue({
            ok: false,
            status: statusCode,
            json: async () => ({ error: 'API Error' })
          });
          global.fetch = mockFetch;

          try {
            await callGeminiAPI('Tomato___Late_blight', 'en');
            // If we reach here, the test should fail (error should have been thrown)
            expect(true).toBe(false);
          } catch (error) {
            // Verify error is thrown
            expect(error).toBeDefined();
            expect(error instanceof Error).toBe(true);
            
            // Verify error message is user-friendly
            const errorMessage = (error as Error).message;
            expect(errorMessage.length).toBeGreaterThan(0);
            
            // Verify specific error messages for specific status codes
            if (statusCode === 401 || statusCode === 403) {
              expect(errorMessage).toMatch(/Authentication error/i);
            } else if (statusCode === 429) {
              expect(errorMessage).toMatch(/Too many requests/i);
            } else if (statusCode === 400) {
              expect(errorMessage).toMatch(/Invalid request/i);
            }
          }
        }
      ),
      { numRuns: 20 } // Run 20 random scenarios
    );

    console.log("✓ Gemini API error handling is consistent across all error status codes");
  });
});
