import { useCallback, useEffect, useRef, useState } from "react";
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
import type {
  GetWinesQueryParamsColorEnumKey,
  GetWinesQueryParamsTypeEnumKey,
} from "@/generated/types/GetWines";
import { useDebounce } from "@/hooks/useDebounce";
import { formatEur } from "@/lib/utils";
import type {
  EntityKind,
  EventSearch,
  ProductSearch,
  SearchFor,
  ShopSearch,
  WinemakerSearch,
  WineSearch,
} from "./types";

interface Props<E extends EntityKind> {
  entity: E;
  search: SearchFor<E>;
  onSearchChange: (next: SearchFor<E>) => void;
}

export function CatalogFilters<E extends EntityKind>({ entity, search, onSearchChange }: Props<E>) {
  if (entity === "products") {
    return (
      <ProductFilters
        onSearchChange={onSearchChange as (next: ProductSearch) => void}
        search={search as ProductSearch}
      />
    );
  }

  if (entity === "wines") {
    return (
      <WineFilters
        onSearchChange={onSearchChange as (next: WineSearch) => void}
        search={search as WineSearch}
      />
    );
  }

  if (entity === "events") {
    return (
      <EventFilters
        onSearchChange={onSearchChange as (next: EventSearch) => void}
        search={search as EventSearch}
      />
    );
  }

  return (
    <GenericFilters
      onSearchChange={onSearchChange as (next: WinemakerSearch | ShopSearch) => void}
      search={search as WinemakerSearch | ShopSearch}
    />
  );
}

function SearchInput({
  value,
  onChange,
  isProduct,
}: {
  value: string;
  onChange: (val: string) => void;
  isProduct: boolean;
}) {
  const [local, setLocal] = useState(value);
  const debounced = useDebounce(local, 300);
  const lastSent = useRef(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (debounced !== lastSent.current) {
      lastSent.current = debounced;
      onChange(debounced);
    }
  }, [debounced, onChange]);

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setLocal(value);
      lastSent.current = value;
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <SectionLabel>Search</SectionLabel>
      <Input
        onChange={(e) => setLocal(e.target.value)}
        placeholder="Search by name..."
        ref={inputRef}
        value={local}
      />
      {!isProduct && (
        <p className="text-[10px] italic text-muted-foreground">
          Search coming soon to API (client-filter active)
        </p>
      )}
    </div>
  );
}

function ColorFilter({
  value,
  onChange,
}: {
  value?: GetWinesQueryParamsColorEnumKey;
  onChange: (val?: GetWinesQueryParamsColorEnumKey) => void;
}) {
  return (
    <div className="space-y-3">
      <SectionLabel>Color</SectionLabel>
      <Select
        onValueChange={(v) =>
          onChange(v === "all" ? undefined : (v as GetWinesQueryParamsColorEnumKey))
        }
        value={value || "all"}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select color" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Colors</SelectItem>
          <SelectItem value="red">Red</SelectItem>
          <SelectItem value="white">White</SelectItem>
          <SelectItem value="rosé">Rosé</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
          <SelectItem value="gray">Gray</SelectItem>
          <SelectItem value="tawny">Tawny</SelectItem>
          <SelectItem value="yellow">Yellow</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function WineFilters({
  search,
  onSearchChange,
}: {
  search: WineSearch;
  onSearchChange: (next: WineSearch) => void;
}) {
  const handleSearchChange = useCallback(
    (q: string) => onSearchChange({ ...search, q: q || undefined }),
    [onSearchChange, search]
  );

  return (
    <div className="space-y-8">
      <SearchInput isProduct={false} onChange={handleSearchChange} value={search.q || ""} />

      <div className="space-y-6">
        <ColorFilter
          onChange={(color) => onSearchChange({ ...search, color })}
          value={search.color}
        />

        <div className="space-y-3">
          <SectionLabel>Region</SectionLabel>
          <Input
            onChange={(e) => onSearchChange({ ...search, region: e.target.value || undefined })}
            placeholder="Filter by region..."
            value={search.region || ""}
          />
        </div>

        <div className="space-y-3">
          <SectionLabel>Type</SectionLabel>
          <Select
            onValueChange={(v) =>
              onSearchChange({
                ...search,
                type: v === "all" ? undefined : (v as GetWinesQueryParamsTypeEnumKey),
              })
            }
            value={search.type || "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="still">Still</SelectItem>
              <SelectItem value="sparkling">Sparkling</SelectItem>
              <SelectItem value="fortified">Fortified</SelectItem>
              <SelectItem value="dessert">Dessert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <SectionLabel>Vintage Year</SectionLabel>
          <Input
            onChange={(e) =>
              onSearchChange({ ...search, vintageYear: e.target.value || undefined })
            }
            placeholder="e.g. 2021"
            type="number"
            value={search.vintageYear ? String(search.vintageYear) : ""}
          />
        </div>
      </div>
    </div>
  );
}

function ProductFilters({
  search,
  onSearchChange,
}: {
  search: ProductSearch;
  onSearchChange: (next: ProductSearch) => void;
}) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(search.minPrice) || 0,
    Number(search.maxPrice) || 300,
  ]);

  useEffect(() => {
    setPriceRange([Number(search.minPrice) || 0, Number(search.maxPrice) || 300]);
  }, [search.minPrice, search.maxPrice]);

  const handleSearchChange = useCallback(
    (s: string) => onSearchChange({ ...search, q: s || undefined }),
    [onSearchChange, search]
  );

  return (
    <div className="space-y-8">
      <SearchInput isProduct={true} onChange={handleSearchChange} value={search.q || ""} />

      <div className="space-y-6">
        <ColorFilter
          onChange={(color) => onSearchChange({ ...search, color })}
          value={search.color}
        />

        <div className="space-y-3">
          <SectionLabel>Region</SectionLabel>
          <Input
            onChange={(e) => onSearchChange({ ...search, region: e.target.value || undefined })}
            placeholder="Filter by region..."
            value={search.region || ""}
          />
        </div>

        <div className="space-y-4">
          <SectionLabel>Price Range</SectionLabel>
          <Slider
            max={search.maxPrice ? Math.max(Number(search.maxPrice), 500) : 500}
            onValueChange={(v) => setPriceRange(v as [number, number])}
            onValueCommitted={(v) => {
              const [min, max] = v as [number, number];
              onSearchChange({ ...search, maxPrice: max, minPrice: min });
            }}
            step={10}
            value={priceRange}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatEur(priceRange[0], { decimals: 0 })}</span>
            <span>{formatEur(priceRange[1], { decimals: 0 })}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            checked={!!search.isBundle}
            id="isBundle"
            onCheckedChange={(checked) =>
              onSearchChange({ ...search, isBundle: !!checked || undefined })
            }
          />
          <Label className="cursor-pointer" htmlFor="isBundle">
            Bundles only
          </Label>
        </div>
      </div>
    </div>
  );
}

function EventFilters({
  search,
  onSearchChange,
}: {
  search: EventSearch;
  onSearchChange: (next: EventSearch) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <SectionLabel>Winemaker</SectionLabel>
        <Input
          onChange={(e) =>
            onSearchChange({ ...search, winemakerName: e.target.value || undefined })
          }
          placeholder="Filter by winemaker..."
          value={search.winemakerName || ""}
        />
      </div>
    </div>
  );
}

function GenericFilters({
  search,
  onSearchChange,
}: {
  search: WinemakerSearch | ShopSearch;
  onSearchChange: (next: WinemakerSearch | ShopSearch) => void;
}) {
  const handleSearchChange = useCallback(
    (q: string) => onSearchChange({ ...search, q: q || undefined }),
    [onSearchChange, search]
  );

  return (
    <div className="space-y-8">
      <SearchInput isProduct={false} onChange={handleSearchChange} value={search.q ?? ""} />
      <div className="py-4">
        <p className="text-sm italic text-muted-foreground">Filters coming soon...</p>
      </div>
    </div>
  );
}
