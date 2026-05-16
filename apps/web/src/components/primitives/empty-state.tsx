import { InboxIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title = "Nothing here yet",
  description = "There's nothing to show.",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-10 text-center",
        className
      )}
      data-slot="empty-state"
    >
      <HugeiconsIcon aria-hidden className="h-10 w-10 text-muted-foreground" icon={InboxIcon} />
      <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
      <p className="max-w-md text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
