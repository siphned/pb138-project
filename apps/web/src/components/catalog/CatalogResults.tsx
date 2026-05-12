import type { ReactNode } from "react";
import { DataGrid } from "@/components/primitives/data-grid";

interface CatalogResultsProps {
  count?: number;
  children: ReactNode;
}

export function CatalogResults({ count, children }: CatalogResultsProps) {
  return (
    <div className="space-y-4">
      {count !== undefined && (
        <p className="text-sm text-muted-foreground">
          {count} {count === 1 ? "result" : "results"}
        </p>
      )}
      <DataGrid variant="catalog">{children}</DataGrid>
    </div>
  );
}
