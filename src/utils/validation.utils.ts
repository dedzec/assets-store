/**
 * Validation Utilities
 * Helper functions for input validation
 */

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if a string is not empty
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validates if a file extension is allowed
 */
export function isAllowedExtension(filename: string, allowedExtensions: string[]): boolean {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return allowedExtensions.includes(extension);
}

/**
 * Validates if a file size is within the limit
 */
export function isFileSizeValid(size: number, maxSize: number): boolean {
  return size <= maxSize;
}
