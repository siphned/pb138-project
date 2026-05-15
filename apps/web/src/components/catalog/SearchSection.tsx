import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import React from "react";
import { DataGrid } from "@/components/primitives/data-grid";
import { Section } from "@/components/primitives/section";
import { Button } from "@/components/ui/button";
import type { ProductSearch, ShopSearch, WinemakerSearch, WineSearch } from "./types";

type ViewAllProps =
  | { viewAllHref: "/explore"; viewAllSearch?: WineSearch }
  | { viewAllHref: "/products"; viewAllSearch?: ProductSearch }
  | { viewAllHref: "/winemakers"; viewAllSearch?: WinemakerSearch }
  | { viewAllHref: "/shops"; viewAllSearch?: ShopSearch };

type SearchSectionProps = {
  heading: string;
  count: number;
  children: ReactNode;
} & ViewAllProps;

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
        {/* Mobile horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:hidden -mx-6 px-6 no-scrollbar">
          {React.Children.map(children, (child) => (
            <div className="w-[80vw] shrink-0 snap-start">{child}</div>
          ))}
        </div>

        {/* Desktop grid */}
        <div className="hidden md:block">
          <DataGrid variant="catalog">{children}</DataGrid>
        </div>

        <div className="flex justify-start">
          <Button
            render={<Link search={viewAllSearch as never} to={viewAllHref} />}
            variant="outline"
          >
            View all ({count})
          </Button>
        </div>
      </div>
    </Section>
  );
}
