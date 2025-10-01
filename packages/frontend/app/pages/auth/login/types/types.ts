// Auth API Types (based on backend Day 2 responses)
// Shared types for auth pages (login, register)

/**
 * User entity from backend
 */
export interface User {
  id: string;
  companyId: string;
  email: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  companyRole: "owner" | "admin" | "member";
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Company entity from backend
 */
export interface Company {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "enterprise";
  maxUsers: number;
  maxStorageBytes: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Auth tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Auth response from login/register
 */
export interface AuthResponse {
  user: User;
  company: Company;
  accessToken: string;
  refreshToken: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
  companyName: string;
}

/**
 * Refresh token request
 */
export interface RefreshRequest {
  refreshToken: string;
}

/**
 * Refresh token response
 */
export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
