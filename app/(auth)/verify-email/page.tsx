"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getStoredUser,
  getPendingVerificationEmail,
  clearPendingVerificationEmail,
  startSession,
  clearTokens,
} from "@/lib/auth";
import apiClient, { getErrorMessage, type ApiError } from "@/lib/api-client";

const CODE_MESSAGES: Record<string, string> = {
  INVALID_VERIFICATION_CODE: "That code is not correct. Check the email and try again.",
  VERIFICATION_CODE_EXPIRED: "This code has expired. Request a new one below.",
  TOO_MANY_ATTEMPTS: "Too many wrong attempts on this code. Request a new one below.",
};

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [needsNewCode, setNeedsNewCode] = useState(false);

  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get("email");
    setEmail(fromQuery || getPendingVerificationEmail() || getStoredUser()?.email || "");
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) {
      toast.error("Enter the email address the code was sent to");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      toast.error("Enter the 6-digit code from your email");
      return;
    }
    setIsVerifying(true);
    try {
      const { data } = await apiClient.post("/auth/verify-email", {
        email: email.trim(),
        token: code,
      });
      const result = data.data;
      clearPendingVerificationEmail();
      if (result.user?.role !== "ADMIN") {
        clearTokens();
        toast.success("Email verified. This account does not have admin access.");
        window.location.assign("/login");
        return;
      }
      startSession(result);
      toast.success("Email verified. Welcome!");
      // Full navigation so the dashboard's AuthProvider reads the new session.
      window.location.assign("/dashboard");
    } catch (err: unknown) {
      const apiCode = (err as ApiError).code || "";
      if (apiCode === "VERIFICATION_CODE_EXPIRED" || apiCode === "TOO_MANY_ATTEMPTS") {
        setNeedsNewCode(true);
        setCode("");
      }
      toast.error(CODE_MESSAGES[apiCode] || getErrorMessage(err, "Verification failed."));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error("Enter your email to get a new code");
      return;
    }
    setIsResending(true);
    try {
      await apiClient.post("/auth/resend-verification", { email: email.trim() });
      toast.success("If this account needs verifying, a new code is on its way.");
      setNeedsNewCode(false);
      setCode("");
      setCooldown(30);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.retryAfterSeconds) setCooldown(Math.ceil(apiErr.retryAfterSeconds));
      toast.error(getErrorMessage(err, "Could not send a new code."));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MailCheck className="h-5 w-5" />
          Verify your email
        </CardTitle>
        <CardDescription>
          Enter the 6-digit code we emailed you. Codes expire after 10 minutes,
          and only the newest code works.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleVerify}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              className="text-center text-lg tracking-[0.5em] font-mono"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              disabled={needsNewCode}
            />
            {needsNewCode && (
              <p className="text-sm text-destructive">
                This code can no longer be used. Request a new one.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isVerifying || needsNewCode || code.length !== 6}
          >
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify and sign in
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
          >
            {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}
          </Button>
          <div className="w-full text-center text-sm">
            <Link href="/login" className="text-gold-700 hover:underline">
              Back to sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
