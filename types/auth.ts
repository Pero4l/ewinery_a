export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "USER" | "ADMIN";
  emailVerified: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
