import type { ReactNode } from "react";
import { DataGrid } from "@/components/primitives/data-grid";

interface CatalogResultsProps {
  count?: number;
  rightSlot?: ReactNode;
  children: ReactNode;
}

export function CatalogResults({ count, rightSlot, children }: CatalogResultsProps) {
  const showHeader = count !== undefined || rightSlot !== undefined;

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between gap-4">
          {count !== undefined ? (
            <p className="text-sm text-muted-foreground">
              {count} {count === 1 ? "result" : "results"}
            </p>
          ) : (
            <span />
          )}
          {rightSlot}
        </div>
      )}
      <DataGrid variant="catalog">{children}</DataGrid>
    </div>
  );
}
