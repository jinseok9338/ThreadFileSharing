/**
 * Backend Internationalization API Contracts
 *
 * Defines types and interfaces for language detection and localized responses
 */

// Language Detection
export interface LanguageDetectionRequest {
  headers: {
    "X-Custom-Language"?: string;
    "Accept-Language"?: string;
  };
}

export interface SupportedLanguage {
  code: string;
  name: string;
  isDefault: boolean;
  isRTL: boolean;
}

// Message Translation
export interface LanguageMessage {
  key: string;
  translations: {
    [languageCode: string]: string;
  };
  context?: string;
  interpolation?: {
    [key: string]: string | number;
  };
}

// Localized API Responses
export interface LocalizedErrorResponse {
  status: "error";
  timestamp: string;
  error: {
    code: string;
    message: string;
    messageKey: string;
    language: string;
  };
  path: string;
}

export interface LocalizedSuccessResponse<T = any> {
  status: "success";
  timestamp: string;
  data: T;
  message?: string; // Optional localized success message
  language: string;
}

// API Endpoints
export interface LanguageInfoResponse {
  supportedLanguages: SupportedLanguage[];
  defaultLanguage: string;
  detectedLanguage?: string;
}

// Service Interfaces
export interface I18nService {
  detectLanguage(request: LanguageDetectionRequest): string;
  translate(
    key: string,
    language: string,
    interpolation?: Record<string, any>
  ): string;
  getSupportedLanguages(): SupportedLanguage[];
  isLanguageSupported(languageCode: string): boolean;
}

export interface LanguageDetectionMiddleware {
  use(req: any, res: any, next: () => void): void;
}
