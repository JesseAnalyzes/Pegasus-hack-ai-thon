/**
 * Input validation and sanitization utilities
 */

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .slice(0, 10000); // Limit length
}

/**
 * Validate date string format (YYYY-MM-DD)
 */
export function isValidDateString(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate array of strings (for filters)
 */
export function isValidStringArray(arr: any): arr is string[] {
  return Array.isArray(arr) && arr.every(item => typeof item === 'string' && item.length <= 255);
}

/**
 * Validate numeric range
 */
export function isValidNumericRange(min?: number, max?: number): boolean {
  if (min !== undefined && (isNaN(min) || min < 0)) return false;
  if (max !== undefined && (isNaN(max) || max < 0)) return false;
  if (min !== undefined && max !== undefined && min > max) return false;
  return true;
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  // Remove potentially dangerous characters but allow common search operators
  return query
    .replace(/[;'"\\]/g, '')
    .trim()
    .slice(0, 500); // Limit search query length
}

