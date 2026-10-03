import { UserRole } from './user';

export interface LoginRequest {
  organizationSlug: string;
  username: string;
  password: string;
}

export interface RegisterRequest {
  organizationName: string;
  organizationSlug: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: 'Bearer';
  role: UserRole;
}