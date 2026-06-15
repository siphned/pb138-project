import type { ReactNode } from "react";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";

interface CatalogStateProps {
  isLoading: boolean;
  isEmpty: boolean;
  isError?: boolean;
  onRetry?: () => void;
  loadingVariant?: "catalog" | "detail" | "form" | "list";
  emptyTitle: string;
  emptyDescription?: string;
  children: ReactNode;
}

/**
 * Standard catalog page state machine: loading → error → empty → results.
 * Extracted to a single helper so each catalog route stays free of nested
 * ternaries (biome `noNestedTernary`). The error branch is opt-in for
 * sub-sections that share a single page-level error boundary.
 */
export function CatalogState({
  isLoading,
  isEmpty,
  isError = false,
  onRetry,
  loadingVariant = "catalog",
  emptyTitle,
  emptyDescription,
  children,
}: CatalogStateProps) {
  if (isLoading) return <LoadingState variant={loadingVariant} />;
  if (isError && onRetry) return <ErrorState onRetry={onRetry} />;
  if (isEmpty) return <EmptyState description={emptyDescription} title={emptyTitle} />;
  return <>{children}</>;
}
