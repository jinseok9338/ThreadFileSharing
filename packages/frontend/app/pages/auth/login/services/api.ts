import API from "~/api/ky";
import { getResponseData, type ApiResponse } from "~/utils/api";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/types";

/**
 * Login API
 * POST /api/v1/auth/login
 */
export const loginAPI = async (
  credentials: LoginRequest
): Promise<AuthResponse> => {
  const response = await API.post("auth/login", {
    json: credentials,
  }).json<ApiResponse<AuthResponse>>();

  return getResponseData(response);
};

/**
 * Register API
 * POST /api/v1/auth/register
 */
export const registerAPI = async (
  data: RegisterRequest
): Promise<AuthResponse> => {
  const response = await API.post("auth/register", {
    json: data,
  }).json<ApiResponse<AuthResponse>>();

  return getResponseData(response);
};

/**
 * Logout API
 * POST /api/v1/auth/logout
 */
export const logoutAPI = async (refreshToken: string): Promise<void> => {
  await API.post("auth/logout", {
    json: { refreshToken },
  });
};

/**
 * Get current user
 * GET /api/v1/auth/me
 */
export const getMeAPI = async () => {
  const response = await API.get("auth/me").json<ApiResponse<AuthResponse>>();
  return getResponseData(response);
};
