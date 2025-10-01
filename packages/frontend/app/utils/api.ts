/**
 * Standard API response wrapper from backend
 */
export interface ApiResponse<T> {
  status: "success" | "error";
  timestamp: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    data?: any;
  };
  path?: string;
}

/**
 * Extract data from API response wrapper
 * Backend wraps all responses in { status, timestamp, data }
 */
export const getResponseData = <T>(response: ApiResponse<T>): T => {
  if (response.status === "error" || !response.data) {
    throw new Error(response.error?.message || "Unknown error");
  }
  return response.data;
};

/**
 * Extract error message from API error response with i18n support
 */
export const getServerErrorMessage = async (
  error: unknown,
  t?: (key: string, options?: any) => string
): Promise<string> => {
  // HTTPError from ky
  if (error && typeof error === "object" && "response" in error) {
    const httpError = error as { response: Response };

    // Try to parse error response
    try {
      const errorData = (await httpError.response.json()) as ApiResponse<any>;

      // If we have a translation function and error code, use i18n
      if (t && errorData.error?.code) {
        const errorCode = errorData.error.code;
        const errorKey = `error.${errorCode}`;

        // Handle special cases with data parameters
        if (errorData.error.data) {
          return t(errorKey, errorData.error.data);
        }

        return t(errorKey);
      }

      // Fallback to server message
      if (errorData.error?.message) {
        return errorData.error.message;
      }

      if (errorData.error?.details) {
        // Handle validation errors (array of strings)
        if (Array.isArray(errorData.error.details)) {
          return errorData.error.details.join(", ");
        }
      }

      return "An error occurred";
    } catch {
      return "An error occurred";
    }
  }

  // Generic Error
  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred";
};
