import axios from "axios";
import { API_BASE_URL } from "./constants";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./auth";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Error shape the API sends: { success:false, message, code?, errors? }. */
export interface ApiError extends Error {
  status?: number;
  code?: string;
  errors?: unknown;
  retryAfterSeconds?: number;
}

/**
 * The API uses `totalPages` (newer endpoints) and `pages` (older ones).
 * Fill in both so every table can read either key.
 */
function normalizePagination(body: unknown) {
  const data = (body as { data?: Record<string, unknown> } | undefined)?.data;
  const p = data?.pagination as Record<string, number> | undefined;
  if (!p || typeof p !== "object") return;
  if (p.pages === undefined && p.totalPages !== undefined) p.pages = p.totalPages;
  if (p.totalPages === undefined && p.pages !== undefined) p.totalPages = p.pages;
  if (p.pages === undefined && p.total !== undefined && p.limit) {
    p.pages = p.totalPages = Math.max(1, Math.ceil(p.total / p.limit));
  }
}

/** Copy the server's message/code onto the axios error so `err.message` is readable. */
function decorateError(error: ApiError & { response?: { status: number; data?: Record<string, unknown>; headers?: Record<string, string> } }) {
  const res = error.response;
  if (!res) return error;
  const body = res.data || {};
  if (typeof body.message === "string" && body.message) error.message = body.message;
  error.status = res.status;
  if (typeof body.code === "string") error.code = body.code;
  if (body.errors !== undefined) error.errors = body.errors;
  const fromBody = (body.errors as { retryAfterSeconds?: number } | undefined)?.retryAfterSeconds;
  const fromHeader = Number(res.headers?.["retry-after"]);
  const retry = typeof fromBody === "number" ? fromBody : Number.isFinite(fromHeader) ? fromHeader : undefined;
  if (retry !== undefined) error.retryAfterSeconds = retry;
  return error;
}

export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message && !/^Request failed with status code/.test(err.message)) {
    return err.message;
  }
  return fallback;
}

// Auth endpoints answer 401 for bad credentials; never try a token refresh for them.
const NO_REFRESH = ["/auth/login", "/auth/refresh", "/auth/verify-email", "/auth/register", "/admin/register"];

apiClient.interceptors.response.use(
  (response) => {
    normalizePagination(response.data);
    return response;
  },
  async (error) => {
    decorateError(error);
    const originalRequest = error.config;
    const url: string = originalRequest?.url || "";

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !NO_REFRESH.some((p) => url.startsWith(p))
    ) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;
        setTokens(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        decorateError(err as ApiError);
        processQueue(err, null);
        clearTokens();
        if (typeof window !== "undefined") {
          // Unverified accounts are refused a refresh with 403 EMAIL_NOT_VERIFIED.
          const notVerified = (err as ApiError).code === "EMAIL_NOT_VERIFIED";
          window.location.assign(notVerified ? "/verify-email" : "/login");
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
