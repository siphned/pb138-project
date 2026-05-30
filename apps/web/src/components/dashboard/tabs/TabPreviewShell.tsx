import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TabPreviewShellProps {
  viewAllTo?: string;
  viewAllLabel?: string;
  createTo?: string;
  createLabel?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Whether more items exist beyond the 10 shown — drives the "View all" CTA. */
  hasMore?: boolean;
  children?: ReactNode;
}

export function TabPreviewShell({
  viewAllTo,
  viewAllLabel = "View all",
  createTo,
  createLabel,
  isLoading,
  isError,
  onRetry,
  isEmpty,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  hasMore,
  children,
}: TabPreviewShellProps) {
  const showViewAllAtBottom = !!viewAllTo && !!hasMore && !isLoading && !isError && !isEmpty;

  return (
    <div className="space-y-4">
      {createTo && createLabel && (
        <div className="flex justify-end">
          <Button render={<Link to={createTo} />} size="sm">
            {createLabel}
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton className="h-16 w-full rounded-md" key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          message="Could not load this section."
          onRetry={onRetry}
          title="Failed to load"
        />
      ) : isEmpty ? (
        <EmptyState description={emptyDescription} title={emptyTitle} />
      ) : (
        children
      )}

      {showViewAllAtBottom && (
        <div className="flex justify-center pt-2">
          <Button render={<Link to={viewAllTo} />} size="sm" variant="outline">
            {viewAllLabel}
            <HugeiconsIcon className="ml-2 h-3.5 w-3.5" icon={ArrowRight01Icon} />
          </Button>
        </div>
      )}
    </div>
  );
}
