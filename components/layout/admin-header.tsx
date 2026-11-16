"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { NotificationBell } from "./notification-bell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "Users",
  "/products": "Products",
  "/categories": "Categories",
  "/orders": "Orders",
  "/transactions": "Transactions",
  "/reviews": "Reviews",
  "/support": "Support Tickets",
  "/notifications": "Notifications",
  "/coupons": "Coupons",
};

export function AdminHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const title =
    pageTitles[pathname] ||
    (pathname.startsWith("/users/")
      ? "User Details"
      : pathname.startsWith("/products/")
      ? "Product Details"
      : pathname.startsWith("/categories/")
      ? "Category Details"
      : pathname.startsWith("/orders/")
      ? "Order Details"
      : pathname.startsWith("/coupons/")
      ? "Coupon Details"
      : pathname.startsWith("/support/")
      ? "Ticket Details"
      : "Admin");

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/70 sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <div className="w-10 shrink-0 lg:hidden" />
        <div className="min-w-0">
          <p className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-gold-700 sm:block">
            eWinery Admin
          </p>
          <h1 className="truncate font-display text-lg font-semibold leading-tight sm:text-xl">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationBell />
        <div className="hidden h-6 w-px bg-border sm:block" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gold-gradient text-xs font-semibold text-gold-900">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium">
                {user?.fullName || "Admin"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground font-normal">
                {user?.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
