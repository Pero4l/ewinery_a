"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push("/login");
    }
  }, [mounted, user, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#722f37] border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <AdminSidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
