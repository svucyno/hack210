/**
 * Unit Tests for Disease Detection Service
 * Tests image validation, format checking, file size validation, and Base64 conversion
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateImageFormat, ValidationResult, convertToBase64, compressImage } from './diseaseService';

/**
 * Helper function to create mock File objects for testing
 */
function createMockFile(
  name: string,
  type: string,
  sizeMB: number
): File {
  const sizeBytes = Math.floor(sizeMB * 1024 * 1024);
  
  // For very small files or to avoid memory issues, create a minimal blob
  // and override the size property
  const content = 'test content';
  const blob = new Blob([content], { type });
  
  // Create a File with the actual size we want to test
  const file = new File([blob], name, { type });
  
  // Override the size property for testing purposes
  Object.defineProperty(file, 'size', {
    value: sizeBytes,
    writable: false
  });
  
  return file;
}

describe('validateImageFormat', () => {
  describe('Valid file types', () => {
    it('should accept JPEG images', () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 2);
      const result: ValidationResult = validateImageFormat(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept PNG images', () => {
      const file = createMockFile('test.png', 'image/png', 3);
      const result: ValidationResult = validateImageFormat(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept WebP images', () => {
      const file = createMockFile('test.webp', 'image/webp', 1.5);
      const result: ValidationResult = validateImageFormat(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Invalid file types', () => {
    it('should reject PDF files with descriptive error', () => {
      const file = createMockFile('document.pdf', 'application/pdf', 1);
      const result: ValidationResult = validateImageFormat(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid file type. Please upload JPEG, PNG, or WebP.');
    });

    it('should reject GIF files with descriptive error', () => {
      const file = createMockFile('animation.gif', 'image/gif', 2);
      const result: ValidationResult = validateImageFormat(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid file type. Please upload JPEG, PNG, or WebP.');
    });

    it('should reject SVG files with descriptive error', () => {
      const file = createMockFile('icon.svg', 'image/svg+xml', 0.5);
      const result: ValidationResult = validateImageFormat(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid file type. Please upload JPEG, PNG, or WebP.');
    });

    it('should reject text files with descriptive error', () => {
      const file = createMockFile('notes.txt', 'text/plain', 0.1);
      const result: ValidationResult = validateImageFormat(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid file type. Please upload JPEG, PNG, or WebP.');
    });
  });

  describe('File size validation', () => {
    it('should accept files under 5MB', () => {
      const file = createMockFile('small.jpg', 'image/jpeg', 4);
      const result: ValidationResult = validateImageFormat(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept files exactly at 5MB boundary', () => {
      const file = createMockFile('boundary.jpg', 'image/jpeg', 5);
      const result: ValidationResult = validateImageFormat(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files over 5MB with descriptive error', () => {
      const file = createMockFile('large.jpg', 'image/jpeg', 6);
      const result: ValidationResult = validateImageFormat(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File size exceeds 5MB. Please choose a smaller image.');
    });

    it('should reject very large files with descriptive error', () => {
      const file = createMockFile('huge.png', 'image/png', 10);
      const result: ValidationResult = validateImageFormat(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File size exceeds 5MB. Please choose a smaller image.');
    });
  });

  describe('Combined validation', () => {
    it('should reject invalid type even if size is valid', () => {
      const file = createMockFile('document.pdf', 'application/pdf', 2);
      const result: ValidationResult = validateImageFormat(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid file type. Please upload JPEG, PNG, or WebP.');
    });

    it('should reject oversized file even if type is valid', () => {
      const file = createMockFile('large.jpg', 'image/jpeg', 7);
      const result: ValidationResult = validateImageFormat(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File size exceeds 5MB. Please choose a smaller image.');
    });

    it('should accept valid type and valid size', () => {
      const file = createMockFile('perfect.webp', 'image/webp', 3.5);
      const result: ValidationResult = validateImageFormat(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle very small files', () => {
      const file = createMockFile('tiny.jpg', 'image/jpeg', 0.001);
      const result: ValidationResult = validateImageFormat(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle empty file name', () => {
      const file = createMockFile('', 'image/png', 2);
      const result: ValidationResult = validateImageFormat(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});

describe('convertToBase64', () => {
  describe('Successful conversion', () => {
    it('should convert JPEG file to valid Base64 data URL', async () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 1);
      const result = await convertToBase64(file);
      
      expect(result).toMatch(/^data:image\/jpeg;base64,/);
      expect(typeof result).toBe('string');
    });

    it('should convert PNG file to valid Base64 data URL', async () => {
      const file = createMockFile('test.png', 'image/png', 2);
      const result = await convertToBase64(file);
      
      expect(result).toMatch(/^data:image\/png;base64,/);
      expect(typeof result).toBe('string');
    });

    it('should convert WebP file to valid Base64 data URL', async () => {
      const file = createMockFile('test.webp', 'image/webp', 1.5);
      const result = await convertToBase64(file);
      
      expect(result).toMatch(/^data:image\/webp;base64,/);
      expect(typeof result).toBe('string');
    });

    it('should handle small files correctly', async () => {
      const file = createMockFile('tiny.jpg', 'image/jpeg', 0.01);
      const result = await convertToBase64(file);
      
      expect(result).toMatch(/^data:image\/jpeg;base64,/);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle larger files correctly', async () => {
      const file = createMockFile('large.png', 'image/png', 4);
      const result = await convertToBase64(file);
      
      expect(result).toMatch(/^data:image\/png;base64,/);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Error handling', () => {
    it('should reject with error message on FileReader error', async () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 1);
      
      // Mock FileReader to simulate error
      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        onload = null;
        onerror = null;
        onabort = null;
        error: any = null;
        result = null;
        
        readAsDataURL() {
          setTimeout(() => {
            if (this.onerror) {
              this.error = { message: 'Simulated read error' };
              this.onerror(new Event('error'));
            }
          }, 0);
        }
      } as any;
      
      await expect(convertToBase64(file)).rejects.toThrow('Failed to read file: Simulated read error');
      
      // Restore original FileReader
      global.FileReader = originalFileReader;
    });

    it('should reject with error message on FileReader abort', async () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 1);
      
      // Mock FileReader to simulate abort
      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        onload = null;
        onerror = null;
        onabort = null;
        error = null;
        result = null;
        
        readAsDataURL() {
          setTimeout(() => {
            if (this.onabort) {
              this.onabort(new Event('abort'));
            }
          }, 0);
        }
      } as any;
      
      await expect(convertToBase64(file)).rejects.toThrow('File reading was aborted');
      
      // Restore original FileReader
      global.FileReader = originalFileReader;
    });
  });

  describe('Data URL format validation', () => {
    it('should return string starting with "data:"', async () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 1);
      const result = await convertToBase64(file);
      
      expect(result.startsWith('data:')).toBe(true);
    });

    it('should include MIME type in data URL', async () => {
      const file = createMockFile('test.png', 'image/png', 1);
      const result = await convertToBase64(file);
      
      expect(result).toContain('image/png');
    });

    it('should include base64 encoding indicator', async () => {
      const file = createMockFile('test.webp', 'image/webp', 1);
      const result = await convertToBase64(file);
      
      expect(result).toContain('base64');
    });
  });
});

describe('compressImage', () => {
  // Mock canvas and image for testing
  let mockCanvas: any;
  let mockContext: any;
  let mockImage: any;
  
  beforeEach(() => {
    // Mock canvas context
    mockContext = {
      drawImage: () => {},
    };
    
    // Mock canvas
    mockCanvas = {
      width: 0,
      height: 0,
      getContext: () => mockContext,
      toDataURL: (type: string, quality: number) => {
        // Simulate different sizes based on quality
        const baseSize = 1000;
        const size = Math.floor(baseSize * quality);
        return `data:${type};base64,${'A'.repeat(size)}`;
      },
    };
    
    // Mock document.createElement for canvas
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = ((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas;
      }
      return originalCreateElement(tagName);
    }) as any;
    
    // Mock Image constructor
    mockImage = {
      width: 1024,
      height: 768,
      onload: null as any,
      onerror: null as any,
      src: '',
    };
    
    (global as any).Image = function() {
      return mockImage;
    };
  });
  
  afterEach(() => {
    // Cleanup is handled by vitest
  });

  describe('Files smaller than maxSizeMB', () => {
    it('should not compress files smaller than 1MB', async () => {
      const file = createMockFile('small.jpg', 'image/jpeg', 0.5);
      const result = await compressImage(file, 1);
      
      // Should return a valid Base64 data URL
      expect(result).toMatch(/^data:image\/jpeg;base64,/);
      expect(typeof result).toBe('string');
    });

    it('should not compress files exactly at maxSizeMB boundary', async () => {
      const file = createMockFile('boundary.jpg', 'image/jpeg', 1);
      const result = await compressImage(file, 1);
      
      expect(result).toMatch(/^data:image\/jpeg;base64,/);
    });
  });

  describe('Files larger than maxSizeMB', () => {
    it('should compress JPEG files larger than 1MB', async () => {
      const file = createMockFile('large.jpg', 'image/jpeg', 2);
      
      // Trigger image load
      const resultPromise = compressImage(file, 1);
      
      // Simulate successful image load
      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload();
        }
      }, 0);
      
      const result = await resultPromise;
      
      expect(result).toMatch(/^data:image\/jpeg;base64,/);
      expect(typeof result).toBe('string');
    });

    it('should compress PNG files larger than 1MB', async () => {
      const file = createMockFile('large.png', 'image/png', 3);
      
      const resultPromise = compressImage(file, 1);
      
      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload();
        }
      }, 0);
      
      const result = await resultPromise;
      
      expect(result).toMatch(/^data:image\/png;base64,/);
    });

    it('should compress WebP files larger than 1MB', async () => {
      const file = createMockFile('large.webp', 'image/webp', 2.5);
      
      const resultPromise = compressImage(file, 1);
      
      // Wait for FileReader and Image to be set up, then trigger onload
      await new Promise(resolve => setTimeout(resolve, 10));
      
      if (mockImage.onload) {
        mockImage.onload();
      }
      
      const result = await resultPromise;
      
      expect(result).toMatch(/^data:image\/webp;base64,/);
    }, 10000);
  });

  describe('Custom maxSizeMB parameter', () => {
    it('should respect custom maxSizeMB of 2MB', async () => {
      const file = createMockFile('medium.jpg', 'image/jpeg', 1.5);
      const result = await compressImage(file, 2);
      
      // File is smaller than 2MB, should not compress
      expect(result).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('should compress when file exceeds custom maxSizeMB', async () => {
      const file = createMockFile('large.jpg', 'image/jpeg', 3);
      
      const resultPromise = compressImage(file, 2);
      
      // Wait for FileReader and Image to be set up, then trigger onload
      await new Promise(resolve => setTimeout(resolve, 10));
      
      if (mockImage.onload) {
        mockImage.onload();
      }
      
      const result = await resultPromise;
      
      expect(result).toMatch(/^data:image\/jpeg;base64,/);
    }, 10000);
  });

  describe('Error handling', () => {
    it('should reject when image fails to load', async () => {
      const file = createMockFile('corrupt.jpg', 'image/jpeg', 2);
      
      // Mock FileReader to succeed but Image to fail
      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        onload = null;
        onerror = null;
        error = null;
        result = null;
        
        readAsDataURL() {
          setTimeout(() => {
            if (this.onload) {
              this.result = 'data:image/jpeg;base64,fakedata';
              this.onload({ target: { result: this.result } } as any);
              
              // Now trigger image error after FileReader succeeds
              setTimeout(() => {
                if (mockImage.onerror) {
                  mockImage.onerror();
                }
              }, 0);
            }
          }, 0);
        }
      } as any;
      
      await expect(compressImage(file, 1)).rejects.toThrow('Failed to load image for compression');
      
      global.FileReader = originalFileReader;
    }, 10000);

    it('should reject when canvas context is unavailable', async () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 2);
      
      // Mock canvas to return null context
      mockCanvas.getContext = () => null;
      
      // Mock FileReader to succeed
      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        onload = null;
        onerror = null;
        error = null;
        result = null;
        
        readAsDataURL() {
          setTimeout(() => {
            if (this.onload) {
              this.result = 'data:image/jpeg;base64,fakedata';
              this.onload({ target: { result: this.result } } as any);
              
              // Now trigger image load after FileReader succeeds
              setTimeout(() => {
                if (mockImage.onload) {
                  mockImage.onload();
                }
              }, 0);
            }
          }, 0);
        }
      } as any;
      
      await expect(compressImage(file, 1)).rejects.toThrow('Failed to get canvas context');
      
      global.FileReader = originalFileReader;
    }, 10000);

    it('should reject when FileReader fails', async () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 2);
      
      // Mock FileReader to fail
      const originalFileReader = global.FileReader;
      global.FileReader = class MockFileReader {
        onload = null;
        onerror = null;
        error: any = null;
        result = null;
        
        readAsDataURL() {
          setTimeout(() => {
            if (this.onerror) {
              this.error = { message: 'Read error' };
              this.onerror(new Event('error'));
            }
          }, 0);
        }
      } as any;
      
      await expect(compressImage(file, 1)).rejects.toThrow('Failed to read file for compression');
      
      global.FileReader = originalFileReader;
    });
  });

  describe('Image dimension handling', () => {
    it('should handle images with large dimensions', async () => {
      const file = createMockFile('huge.jpg', 'image/jpeg', 2);
      
      // Set very large dimensions
      mockImage.width = 4096;
      mockImage.height = 3072;
      
      const resultPromise = compressImage(file, 1);
      
      // Wait for FileReader and Image to be set up, then trigger onload
      await new Promise(resolve => setTimeout(resolve, 10));
      
      if (mockImage.onload) {
        mockImage.onload();
      }
      
      const result = await resultPromise;
      
      expect(result).toMatch(/^data:image\/jpeg;base64,/);
      // Canvas should have been resized
      expect(mockCanvas.width).toBeLessThanOrEqual(2048);
      expect(mockCanvas.height).toBeLessThanOrEqual(2048);
    }, 10000);

    it('should maintain aspect ratio when scaling down', async () => {
      const file = createMockFile('wide.jpg', 'image/jpeg', 2);
      
      // Set wide image dimensions
      mockImage.width = 3000;
      mockImage.height = 1000;
      
      const resultPromise = compressImage(file, 1);
      
      // Wait for FileReader and Image to be set up, then trigger onload
      await new Promise(resolve => setTimeout(resolve, 10));
      
      if (mockImage.onload) {
        mockImage.onload();
      }
      
      await resultPromise;
      
      // Check aspect ratio is maintained (3:1)
      const aspectRatio = mockCanvas.width / mockCanvas.height;
      expect(aspectRatio).toBeCloseTo(3, 1);
    }, 10000);

    it('should handle portrait orientation images', async () => {
      const file = createMockFile('tall.jpg', 'image/jpeg', 2);
      
      // Set tall image dimensions
      mockImage.width = 1000;
      mockImage.height = 3000;
      
      const resultPromise = compressImage(file, 1);
      
      // Wait for FileReader and Image to be set up, then trigger onload
      await new Promise(resolve => setTimeout(resolve, 10));
      
      if (mockImage.onload) {
        mockImage.onload();
      }
      
      await resultPromise;
      
      // Check aspect ratio is maintained (1:3)
      const aspectRatio = mockCanvas.width / mockCanvas.height;
      expect(aspectRatio).toBeCloseTo(1/3, 1);
    }, 10000);
  });

  describe('Quality adjustment', () => {
    it('should return compressed data URL with appropriate quality', async () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 2);
      
      const resultPromise = compressImage(file, 1);
      
      // Wait for FileReader and Image to be set up, then trigger onload
      await new Promise(resolve => setTimeout(resolve, 10));
      
      if (mockImage.onload) {
        mockImage.onload();
      }
      
      const result = await resultPromise;
      
      // Should return a valid Base64 string
      expect(result).toMatch(/^data:image\/jpeg;base64,/);
      expect(result.length).toBeGreaterThan(0);
    }, 10000);
  });
});
