"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: { label: string; href: string; icon?: React.ReactNode };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action && (
        <Button asChild>
          <Link href={action.href}>
            {action.icon || <Plus className="mr-2 h-4 w-4" />}
            {action.label}
          </Link>
        </Button>
      )}
    </div>
  );
}
