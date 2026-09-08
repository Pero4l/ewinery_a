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
import { isEmailVerified } from "@/lib/utils";
import {
  getAccessToken,
  getStoredUser,
  setTokens,
  setStoredUser,
  clearTokens,
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

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await apiClient.post("/auth/login", {
        email,
        password,
      });
      const result = data.data;
      setTokens(result.accessToken, result.refreshToken);
      setStoredUser(result.user);
      setUser(result.user);
      if (result.user && !isEmailVerified(result.user)) {
        router.push("/verify-email");
      } else {
        router.push("/dashboard");
      }
    },
    [router]
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
      const result = res.data;
      setTokens(result.accessToken, result.refreshToken);
      setStoredUser(result.user);
      setUser(result.user);
      if (result.user && !isEmailVerified(result.user)) {
        router.push("/verify-email");
      } else {
        router.push("/dashboard");
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
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