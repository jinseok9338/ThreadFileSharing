// Frontend Auth API Types (based on backend Day 2)

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

export interface AuthResponse {
  user: User;
  company: Company;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  timestamp: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  path?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName?: string;
  companyName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}


