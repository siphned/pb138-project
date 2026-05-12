import { AlertCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this page. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center",
        className
      )}
      data-slot="error-state"
      role="alert"
    >
      <HugeiconsIcon aria-hidden className="h-10 w-10 text-destructive" icon={AlertCircleIcon} />
      <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
      <p className="max-w-md text-muted-foreground">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try again
        </Button>
      )}
    </div>
  );
}
