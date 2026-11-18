const ACCESS_TOKEN_KEY = "ewinery_access_token";
const REFRESH_TOKEN_KEY = "ewinery_refresh_token";
const USER_KEY = "ewinery_user";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: Record<string, unknown>): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAdmin(user: { role?: string } | null): boolean {
  return user?.role === "ADMIN";
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// Email awaiting verification (set when login answers 403 EMAIL_NOT_VERIFIED or after signup).
const PENDING_EMAIL_KEY = "ewinery_pending_verification_email";

export function setPendingVerificationEmail(email: string): void {
  try {
    sessionStorage.setItem(PENDING_EMAIL_KEY, email);
  } catch {
    // storage unavailable; the verify page lets the user type the email
  }
}

export function getPendingVerificationEmail(): string {
  try {
    return sessionStorage.getItem(PENDING_EMAIL_KEY) || "";
  } catch {
    return "";
  }
}

export function clearPendingVerificationEmail(): void {
  try {
    sessionStorage.removeItem(PENDING_EMAIL_KEY);
  } catch {
    // ignore
  }
}

/** Store a session from /auth/login or /auth/verify-email (same payload). */
export function startSession(result: {
  accessToken: string;
  refreshToken: string;
  user: Record<string, unknown>;
}): void {
  setTokens(result.accessToken, result.refreshToken);
  setStoredUser(result.user);
}
