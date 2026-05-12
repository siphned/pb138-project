import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { DataGrid } from "@/components/primitives/data-grid";
import { Section } from "@/components/primitives/section";
import { Button } from "@/components/ui/button";

interface SearchSectionProps {
  heading: string;
  count: number;
  viewAllHref: string;
  viewAllSearch?: Record<string, unknown>;
  children: ReactNode;
}

export function SearchSection({
  heading,
  count,
  viewAllHref,
  viewAllSearch,
  children,
}: SearchSectionProps) {
  if (count === 0) return null;

  return (
    <Section heading={heading}>
      <div className="space-y-6">
        <DataGrid variant="catalog">{children}</DataGrid>
        <div className="flex justify-start">
          <Button asChild variant="outline">
            <Link search={viewAllSearch} to={viewAllHref as any}>
              View all ({count})
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
