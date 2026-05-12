import type React from "react";
import { SectionLabel } from "@/components/primitives/section-label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface CatalogFiltersProps {
  entity: "wines" | "products" | "winemakers";
  search: Record<string, unknown>;
  onSearchChange: (next: Record<string, unknown>) => void;
}

export function CatalogFilters({ entity, search, onSearchChange }: CatalogFiltersProps) {
  const handleQChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange({ ...search, q: e.target.value || undefined });
  };

  const handleColorChange = (color: string, checked: boolean) => {
    const currentColors = (search.color as string[]) || [];
    const nextColors = checked
      ? [...currentColors, color]
      : currentColors.filter((c) => c !== color);
    onSearchChange({ ...search, color: nextColors.length ? nextColors : undefined });
  };

  const handleRegionChange = (region: string) => {
    onSearchChange({ ...search, region: region === "all" ? undefined : region });
  };

  const handlePriceChange = (values: number[]) => {
    onSearchChange({ ...search, maxPrice: values[1], minPrice: values[0] });
  };

  const handleBundleChange = (checked: boolean) => {
    onSearchChange({ ...search, isBundle: checked || undefined });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <SectionLabel>Search</SectionLabel>
        <Input onChange={handleQChange} placeholder="Search by name..." value={search.q || ""} />
      </div>

      {entity === "wines" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <SectionLabel>Color</SectionLabel>
            <div className="space-y-2">
              {["Red", "White", "Rosé"].map((color) => (
                <div className="flex items-center space-x-2" key={color}>
                  <Checkbox
                    checked={(search.color as string[])?.includes(color.toLowerCase())}
                    id={`color-${color}`}
                    onCheckedChange={(checked) => handleColorChange(color.toLowerCase(), !!checked)}
                  />
                  <Label className="cursor-pointer" htmlFor={`color-${color}`}>
                    {color}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <SectionLabel>Region</SectionLabel>
            <Select onValueChange={handleRegionChange} value={search.region || "all"}>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="moravia">Moravia</SelectItem>
                <SelectItem value="bohemia">Bohemia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {entity === "winemakers" && (
        <div className="space-y-3">
          <SectionLabel>Region</SectionLabel>
          <Select onValueChange={handleRegionChange} value={search.region || "all"}>
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="moravia">Moravia</SelectItem>
              <SelectItem value="bohemia">Bohemia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {entity === "products" && (
        <div className="space-y-6">
          <div className="space-y-4">
            <SectionLabel>Price Range</SectionLabel>
            <Slider
              max={5000}
              onValueChange={handlePriceChange}
              step={10}
              value={[search.minPrice || 0, search.maxPrice || 2000]}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>€{search.minPrice || 0}</span>
              <span>€{search.maxPrice || 2000}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={!!search.isBundle}
              id="isBundle"
              onCheckedChange={handleBundleChange}
            />
            <Label className="cursor-pointer" htmlFor="isBundle">
              Bundles only
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}
