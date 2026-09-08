import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isEmailVerified(
  user:
    | {
        isEmailVerified?: boolean;
        emailVerified?: boolean;
        emailVerifiedAt?: string | null;
      }
    | null
    | undefined
): boolean {
  if (!user) return false;
  if (typeof user.isEmailVerified === "boolean") return user.isEmailVerified;
  if (user.emailVerified === true) return true;
  if (user.emailVerified === false) return false;
  return Boolean(user.emailVerifiedAt);
}

export function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["sales", "trend", "records", "items", "products", "data"]) {
      const value = record[key];
      if (Array.isArray(value)) return value as T[];
    }
  }
  return [];
}

function toDate(date: string | number | Date | null | undefined): Date | null {
  if (date === null || date === undefined || date === "") return null;
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatCurrency(amount: number | null | undefined): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(
  date: string | number | Date | null | undefined
): string {
  const d = toDate(date);
  if (!d) return "-";
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(
  date: string | number | Date | null | undefined
): string {
  const d = toDate(date);
  if (!d) return "-";
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}