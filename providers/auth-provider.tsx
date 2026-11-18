"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import apiClient from "@/lib/api-client";
import type { ApiError } from "@/lib/api-client";
import {
  getAccessToken,
  getStoredUser,
  getRefreshToken,
  clearTokens,
  startSession,
  setPendingVerificationEmail,
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    signupKey: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (!getAccessToken()) return null;
    return getStoredUser();
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const goToVerify = useCallback(
    (email: string) => {
      setPendingVerificationEmail(email);
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    },
    [router]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      let result;
      try {
        const { data } = await apiClient.post("/auth/login", { email, password });
        result = data.data;
      } catch (err) {
        // Password matched but the email is unverified: no tokens are issued.
        if ((err as ApiError).code === "EMAIL_NOT_VERIFIED") {
          goToVerify(email);
          throw Object.assign(new Error("Please verify your email to continue."), {
            code: "EMAIL_NOT_VERIFIED",
          });
        }
        throw err;
      }
      if (result.user?.role !== "ADMIN") {
        // Revoke the session we were just given; this dashboard is admin-only.
        try {
          await apiClient.post(
            "/auth/logout",
            { refreshToken: result.refreshToken },
            { headers: { Authorization: `Bearer ${result.accessToken}` } }
          );
        } catch {
          // ignore
        }
        throw new Error("This account does not have admin access.");
      }
      startSession(result);
      setUser(result.user);
      router.push("/dashboard");
    },
    [router, goToVerify]
  );

  const register = useCallback(
    async (data: {
      fullName: string;
      email: string;
      phone: string;
      password: string;
      signupKey: string;
    }) => {
      const { data: res } = await apiClient.post("/admin/register", data);
      const result = res.data || {};
      // Every account must verify its email before it can sign in.
      if (result.accessToken && result.refreshToken && result.user?.isEmailVerified) {
        startSession(result);
        setUser(result.user);
        router.push("/dashboard");
        return;
      }
      goToVerify(data.email);
    },
    [router, goToVerify]
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout", { refreshToken: getRefreshToken() });
    } catch {
      // ignore logout errors
    }
    clearTokens();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}