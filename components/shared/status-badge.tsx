import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  colorClass?: string;
}

export function StatusBadge({ label, colorClass }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colorClass || "bg-gray-100 text-gray-800 border-gray-200"
      )}
    >
      {label}
    </span>
  );
}
