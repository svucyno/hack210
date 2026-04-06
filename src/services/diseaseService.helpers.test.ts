/**
 * Unit tests for diseaseService helper functions
 * Tests confidence color mapping, treatment suggestions, and result formatting
 */

import { describe, it, expect } from 'vitest';
import { 
  getConfidenceColor, 
  getTreatment, 
  formatDetectionResult,
  DetectionResult 
} from './diseaseService';

describe('diseaseService helper functions', () => {
  describe('getConfidenceColor', () => {
    it('should return green for confidence > 80%', () => {
      expect(getConfidenceColor(85)).toBe('text-green-600');
      expect(getConfidenceColor(90)).toBe('text-green-600');
      expect(getConfidenceColor(100)).toBe('text-green-600');
      expect(getConfidenceColor(81)).toBe('text-green-600');
    });

    it('should return yellow for confidence 50-80%', () => {
      expect(getConfidenceColor(65)).toBe('text-yellow-600');
      expect(getConfidenceColor(50)).toBe('text-yellow-600');
      expect(getConfidenceColor(80)).toBe('text-yellow-600');
      expect(getConfidenceColor(75)).toBe('text-yellow-600');
    });

    it('should return red for confidence < 50%', () => {
      expect(getConfidenceColor(30)).toBe('text-red-600');
      expect(getConfidenceColor(49)).toBe('text-red-600');
      expect(getConfidenceColor(0)).toBe('text-red-600');
      expect(getConfidenceColor(25)).toBe('text-red-600');
    });
  });

  describe('getTreatment', () => {
    it('should return English treatment for known disease', () => {
      const treatment = getTreatment('Tomato___Late_blight', 'en');
      expect(treatment).toContain('Remove infected leaves');
      expect(treatment).toContain('copper-based fungicide');
    });

    it('should return Hindi treatment for known disease', () => {
      const treatment = getTreatment('Tomato___Late_blight', 'hi');
      expect(treatment).toContain('संक्रमित पत्तियों');
      expect(treatment).toContain('तांबा आधारित');
    });

    it('should return Telugu treatment for known disease', () => {
      const treatment = getTreatment('Tomato___Late_blight', 'te');
      expect(treatment).toContain('సోకిన ఆకులను');
      expect(treatment).toContain('రాగి ఆధారిత');
    });

    it('should return default treatment for unknown disease in English', () => {
      const treatment = getTreatment('Unknown_Disease', 'en');
      expect(treatment).toContain('Consult with a local agricultural expert');
    });

    it('should return default treatment for unknown disease in Hindi', () => {
      const treatment = getTreatment('Unknown_Disease', 'hi');
      expect(treatment).toContain('स्थानीय कृषि विशेषज्ञ');
    });

    it('should return default treatment for unknown disease in Telugu', () => {
      const treatment = getTreatment('Unknown_Disease', 'te');
      expect(treatment).toContain('స్థానిక వ్యవసాయ నిపుణుడిని');
    });

    it('should default to English when no language specified', () => {
      const treatment = getTreatment('Tomato___Healthy');
      expect(treatment).toContain('Your plant looks healthy');
    });
  });

  describe('formatDetectionResult', () => {
    it('should format result with all required fields', () => {
      const input: DetectionResult = {
        diseaseName: 'Tomato___Late_blight',
        confidence: 85,
        treatment: '',
        timestamp: '2024-01-15T10:30:00Z'
      };

      const result = formatDetectionResult(input, 'en');

      expect(result).toHaveProperty('diseaseName', 'Tomato___Late_blight');
      expect(result).toHaveProperty('confidence', 85);
      expect(result).toHaveProperty('treatment');
      expect(result.treatment).toContain('Remove infected leaves');
      expect(result).toHaveProperty('timestamp', '2024-01-15T10:30:00Z');
    });

    it('should set lowConfidenceWarning to true for confidence < 50%', () => {
      const input: DetectionResult = {
        diseaseName: 'Tomato___Late_blight',
        confidence: 45,
        treatment: '',
        timestamp: '2024-01-15T10:30:00Z'
      };

      const result = formatDetectionResult(input, 'en');

      expect(result.lowConfidenceWarning).toBe(true);
    });

    it('should set lowConfidenceWarning to false for confidence >= 50%', () => {
      const input: DetectionResult = {
        diseaseName: 'Tomato___Late_blight',
        confidence: 50,
        treatment: '',
        timestamp: '2024-01-15T10:30:00Z'
      };

      const result = formatDetectionResult(input, 'en');

      expect(result.lowConfidenceWarning).toBe(false);
    });

    it('should normalize confidence values above 100', () => {
      const input: DetectionResult = {
        diseaseName: 'Tomato___Late_blight',
        confidence: 150,
        treatment: '',
        timestamp: '2024-01-15T10:30:00Z'
      };

      const result = formatDetectionResult(input, 'en');

      expect(result.confidence).toBe(100);
    });

    it('should normalize confidence values below 0', () => {
      const input: DetectionResult = {
        diseaseName: 'Tomato___Late_blight',
        confidence: -10,
        treatment: '',
        timestamp: '2024-01-15T10:30:00Z'
      };

      const result = formatDetectionResult(input, 'en');

      expect(result.confidence).toBe(0);
    });

    it('should get treatment in specified language', () => {
      const input: DetectionResult = {
        diseaseName: 'Tomato___Late_blight',
        confidence: 85,
        treatment: '',
        timestamp: '2024-01-15T10:30:00Z'
      };

      const resultHi = formatDetectionResult(input, 'hi');
      expect(resultHi.treatment).toContain('संक्रमित पत्तियों');

      const resultTe = formatDetectionResult(input, 'te');
      expect(resultTe.treatment).toContain('సోకిన ఆకులను');
    });

    it('should generate timestamp if not provided', () => {
      const input: DetectionResult = {
        diseaseName: 'Tomato___Late_blight',
        confidence: 85,
        treatment: '',
        timestamp: ''
      };

      const result = formatDetectionResult(input, 'en');

      expect(result.timestamp).toBeTruthy();
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should default to English when no language specified', () => {
      const input: DetectionResult = {
        diseaseName: 'Tomato___Healthy',
        confidence: 90,
        treatment: '',
        timestamp: '2024-01-15T10:30:00Z'
      };

      const result = formatDetectionResult(input);

      expect(result.treatment).toContain('Your plant looks healthy');
    });

    it('should handle edge case: confidence exactly 50%', () => {
      const input: DetectionResult = {
        diseaseName: 'Tomato___Late_blight',
        confidence: 50,
        treatment: '',
        timestamp: '2024-01-15T10:30:00Z'
      };

      const result = formatDetectionResult(input, 'en');

      expect(result.confidence).toBe(50);
      expect(result.lowConfidenceWarning).toBe(false);
    });

    it('should handle edge case: confidence exactly 49%', () => {
      const input: DetectionResult = {
        diseaseName: 'Tomato___Late_blight',
        confidence: 49,
        treatment: '',
        timestamp: '2024-01-15T10:30:00Z'
      };

      const result = formatDetectionResult(input, 'en');

      expect(result.confidence).toBe(49);
      expect(result.lowConfidenceWarning).toBe(true);
    });
  });
});
