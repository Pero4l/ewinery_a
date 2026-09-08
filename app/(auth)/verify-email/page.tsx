"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { getStoredUser } from "@/lib/auth";
import apiClient from "@/lib/api-client";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    setEmail(getStoredUser()?.email ?? "");
  }, []);

  const handleVerify = async () => {
    if (!token.trim()) {
      toast.error("Please enter the verification token from your email");
      return;
    }
    setIsVerifying(true);
    try {
      await apiClient.post("/auth/verify-email", { token: token.trim() });
      toast.success("Email verified successfully!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Verification failed. Please check your token.";
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error("Enter your email to resend the verification");
      return;
    }
    setIsResending(true);
    try {
      await apiClient.post("/auth/resend-verification", { email });
      toast.success("Verification email sent. Check your inbox.");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to resend verification email.";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MailCheck className="h-5 w-5" />
          Verify Your Email
        </CardTitle>
        <CardDescription>
          We sent a verification token to your email. Enter it below, or resend
          the email if you didn't receive it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="token">Verification Token</Label>
          <Input
            id="token"
            placeholder="Paste the token from your email"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          className="w-full"
          onClick={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify Email
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          onClick={handleResend}
          disabled={isResending}
        >
          {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Resend Verification Email
        </Button>
        <div className="w-full text-center text-sm">
          <Link href="/login" className="text-[#722f37] hover:underline">
            Back to sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}