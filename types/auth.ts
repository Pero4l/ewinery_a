export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "USER" | "ADMIN";
  emailVerified?: boolean;
  emailVerifiedAt?: string | null;
  isEmailVerified?: boolean;
  isActive?: boolean;
  termsVersion?: string | null;
  termsAcceptedAt?: string | null;
  ageConfirmedAt?: string | null;
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
