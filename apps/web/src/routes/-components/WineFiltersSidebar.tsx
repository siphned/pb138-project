import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { GetProductsQueryParams } from "@/generated/types/GetProducts";

interface WineFiltersSidebarProps {
  search: GetProductsQueryParams;
}

const WINE_TYPES = [
  { id: "red", label: "Red Wine" },
  { id: "white", label: "White Wine" },
  { id: "rosé", label: "Rosé Wine" },
  { id: "sparkling", label: "Sparkling" },
  { id: "dessert", label: "Dessert Wine" },
];

const REGIONS = [
  { id: "France", label: "France" },
  { id: "Italy", label: "Italy" },
  { id: "Spain", label: "Spain" },
  { id: "Moravia", label: "Moravia" },
  { id: "Austria", label: "Austria" },
];

export function WineFiltersSidebar({ search }: WineFiltersSidebarProps) {
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState<GetProductsQueryParams>(search);

  const handleFilterChange = (key: keyof GetProductsQueryParams, value: unknown) => {
    setLocalSearch((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const applyFilters = () => {
    navigate({ to: "/wines", search: localSearch });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setLocalSearch({ sort: "newest", page: 1 });
            navigate({ to: "/wines", search: { sort: "newest", page: 1 } });
          }}
        >
          Clear All
        </Button>
      </div>

      <Separator />

      {/* Wine Type */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm uppercase tracking-wider">Wine Type</h3>
        <div className="space-y-2">
          {WINE_TYPES.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type.id}`}
                checked={localSearch.type === type.id}
                onCheckedChange={(checked) =>
                  handleFilterChange("type", checked ? type.id : undefined)
                }
              />
              <Label
                htmlFor={`type-${type.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm uppercase tracking-wider">Price Range</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={localSearch.minPrice || ""}
            onChange={(e) =>
              handleFilterChange("minPrice", e.target.value ? Number(e.target.value) : undefined)
            }
            className="h-8"
          />
          <span>-</span>
          <Input
            type="number"
            placeholder="Max"
            value={localSearch.maxPrice || ""}
            onChange={(e) =>
              handleFilterChange("maxPrice", e.target.value ? Number(e.target.value) : undefined)
            }
            className="h-8"
          />
        </div>
      </div>

      <Separator />

      {/* Region */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm uppercase tracking-wider">Region</h3>
        <div className="space-y-2">
          {REGIONS.map((region) => (
            <div key={region.id} className="flex items-center space-x-2">
              <Checkbox
                id={`region-${region.id}`}
                checked={localSearch.region === region.id}
                onCheckedChange={(checked) =>
                  handleFilterChange("region", checked ? region.id : undefined)
                }
              />
              <Label
                htmlFor={`region-${region.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {region.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button
        className="w-full bg-primary text-primary-foreground rounded-xl"
        onClick={applyFilters}
      >
        Apply Filters
      </Button>
    </div>
  );
}
