import { useCallback, useEffect, useRef, useState } from "react";
import { SectionLabel } from "@/components/primitives/section-label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GetWinesQueryParamsColorEnumKey } from "@/generated/types/GetWines";
import { useDebounce } from "@/hooks/useDebounce";
import type { WineSearch } from "./types";

interface SearchPageFiltersProps {
  search: WineSearch;
  onSearchChange: (next: WineSearch) => void;
}

export function SearchPageFilters({ search, onSearchChange }: SearchPageFiltersProps) {
  const handleSearchChange = useCallback(
    (q: string) => onSearchChange({ ...search, q: q || undefined }),
    [onSearchChange, search]
  );

  return (
    <div className="space-y-8">
      <SearchInput onChange={handleSearchChange} value={search.q || ""} />

      <div className="space-y-6">
        <ColorFilter
          onChange={(color) => onSearchChange({ ...search, color })}
          value={search.color as GetWinesQueryParamsColorEnumKey}
        />
      </div>
    </div>
  );
}

function SearchInput({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [local, setLocal] = useState(value);
  const debounced = useDebounce(local, 300);
  const lastSent = useRef(value);

  useEffect(() => {
    if (debounced !== lastSent.current) {
      lastSent.current = debounced;
      onChange(debounced);
    }
  }, [debounced, onChange]);

  // Sync local when value changes externally (e.g. on mount or from URL)
  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <div className="space-y-2">
      <SectionLabel>Search</SectionLabel>
      <Input
        onChange={(e) => setLocal(e.target.value)}
        placeholder="Search everything..."
        value={local}
      />
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
      <SectionLabel>Wine Color</SectionLabel>
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
