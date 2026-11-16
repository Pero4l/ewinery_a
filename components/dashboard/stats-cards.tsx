"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { formatCurrency } from "@/lib/utils";
import { Users, Package, ShoppingCart, Wallet } from "lucide-react";

export function StatsCards() {
  const { data: stats, isLoading } = useDashboardStats();

  const cards = [
    {
      title: "Total Revenue",
      value: stats ? formatCurrency(stats.totalRevenue || 0) : "₦0",
      icon: Wallet,
      hint: "All completed payments",
      featured: true,
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders?.toLocaleString() || "0",
      icon: ShoppingCart,
      hint: "Across all statuses",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts?.toLocaleString() || "0",
      icon: Package,
      hint: "Listed in the catalogue",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers?.toLocaleString() || "0",
      icon: Users,
      hint: "Registered customers",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
              </div>
              <div className="h-8 w-28 animate-pulse rounded bg-muted" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={
            card.featured
              ? "relative bg-sidebar text-sidebar-foreground ring-gold-500/30"
              : "relative transition-shadow hover:shadow-md hover:shadow-gold-900/5"
          }
        >
          {card.featured && (
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gold-500/20 blur-2xl"
            />
          )}
          <CardContent className="relative py-2">
            <div className="flex items-start justify-between">
              <p
                className={
                  card.featured
                    ? "text-sm font-medium text-gold-300"
                    : "text-sm font-medium text-muted-foreground"
                }
              >
                {card.title}
              </p>
              <div
                className={
                  card.featured
                    ? "flex h-10 w-10 items-center justify-center rounded-xl bg-gold-gradient shadow-md shadow-gold-500/20"
                    : "flex h-10 w-10 items-center justify-center rounded-xl border border-gold-200 bg-gold-50"
                }
              >
                <card.icon
                  className={
                    card.featured ? "h-5 w-5 text-gold-900" : "h-5 w-5 text-gold-700"
                  }
                />
              </div>
            </div>
            <p
              className={
                card.featured
                  ? "mt-2 text-2xl font-semibold tracking-tight text-white tabular-nums sm:text-3xl"
                  : "mt-2 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl"
              }
            >
              {card.value}
            </p>
            <p
              className={
                card.featured
                  ? "mt-1 text-xs text-sidebar-foreground/55"
                  : "mt-1 text-xs text-muted-foreground"
              }
            >
              {card.hint}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
