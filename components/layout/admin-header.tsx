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
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="lg:hidden w-10" />
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-0.5 hover:bg-gray-100 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#722f37] text-white text-xs">
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
