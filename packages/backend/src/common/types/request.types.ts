export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  companyId: string;
  role?: string;
}

export interface AuthenticatedRequest {
  user: AuthenticatedUser;
}
