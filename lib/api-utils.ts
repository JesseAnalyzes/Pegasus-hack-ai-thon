/**
 * Utility functions for API error handling and response parsing
 */

export interface ApiError {
  error: string;
  message?: string;
  details?: any;
}

/**
 * Parse API error response
 */
export async function parseApiError(response: Response): Promise<ApiError> {
  try {
    const data = await response.json();
    return {
      error: data.error || 'Unknown error',
      message: data.message,
      details: data.details,
    };
  } catch {
    return {
      error: `HTTP ${response.status}: ${response.statusText}`,
    };
  }
}

/**
 * Handle fetch errors with proper error messages
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await parseApiError(response);
    throw new Error(error.message || error.error);
  }
  return response.json();
}

