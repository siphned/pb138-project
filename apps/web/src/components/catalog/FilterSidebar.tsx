import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { SectionLabel } from "@/components/primitives/section-label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Slider } from "../../components/ui/slider";

export type CheckboxFilterSection = {
  type: "checkbox";
  label: string;
  key: string;
  options: { id: string; label: string }[];
};

export type PriceRangeFilterSection = {
  type: "price-range";
  label: string;
  minKey: string;
  maxKey: string;
};

export type RatingFilterSection = {
  type: "rating";
  label: string;
  key: string;
};

export type FilterSection = CheckboxFilterSection | PriceRangeFilterSection | RatingFilterSection;

export interface FilterSidebarProps {
  title?: string;
  sections: FilterSection[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onClear: () => void;
}

// ─── Section sub-components ───────────────────────────────────────────────────

function CheckboxSection({
  section,
  values,
  onChange,
}: {
  section: CheckboxFilterSection;
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-3">
      <SectionLabel>{section.label}</SectionLabel>
      <div className="space-y-2">
        {section.options.map((option) => (
          <div className="flex items-center gap-2" key={option.id}>
            <Checkbox
              checked={(values[section.key] as string[] | undefined)?.includes(option.id) ?? false}
              id={`${section.key}-${option.id}`}
              onCheckedChange={(checked) => {
                const current = (values[section.key] as string[] | undefined) ?? [];
                const next = checked
                  ? [...current, option.id]
                  : current.filter((v) => v !== option.id);
                onChange(section.key, next.length > 0 ? next : undefined);
              }}
            />
            <Label
              className="cursor-pointer text-sm font-medium"
              htmlFor={`${section.key}-${option.id}`}
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

function PriceRangeSection({
  section,
  values,
  onChange,
}: {
  section: PriceRangeFilterSection;
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}) {
  const MAX_PRICE = 5000;

  const minPrice = (values[section.minKey] as number) ?? 0;
  const maxPrice = (values[section.maxKey] as number) ?? MAX_PRICE;

  const [localValue, setLocalValue] = useState([minPrice, maxPrice]);

  // Sync from parent if URL changes (e.g. "Clear All" or browser back/forward)
  useEffect(() => {
    setLocalValue([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  // Debounce updates to the parent/URL to avoid race conditions
  useEffect(() => {
    // Only run the update if the local state differs from the URL state.
    // This prevents an update loop when the URL change syncs back.
    if (localValue[0] === minPrice && localValue[1] === maxPrice) {
      return;
    }

    const timer = setTimeout(() => {
      onChange(section.minKey, localValue[0] === 0 ? undefined : localValue[0]);
      onChange(section.maxKey, localValue[1] === MAX_PRICE ? undefined : localValue[1]);
    }, 500); // 500ms debounce time

    return () => clearTimeout(timer);
  }, [localValue, minPrice, maxPrice, onChange, section.minKey, section.maxKey]);

  return (
    <div className="space-y-4">
      <SectionLabel>{section.label}</SectionLabel>
      <Slider
        max={MAX_PRICE}
        onValueChange={(v) => setLocalValue(v as number[])}
        step={10}
        value={localValue}
      />
      <div className="text-sm text-muted-foreground">
        Price: €{localValue[0]} -{" "}
        {localValue[1] === MAX_PRICE ? `${MAX_PRICE}+` : `€${localValue[1]}`}
      </div>
    </div>
  );
}

function RatingSection({
  section,
  values,
  onChange,
}: {
  section: RatingFilterSection;
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-3">
      <SectionLabel>{section.label}</SectionLabel>
      <div className="space-y-1">
        {[4, 3, 2, 1].map((n) => {
          const isSelected = values[section.key] === n;
          return (
            <Button
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm justify-start",
                isSelected && "bg-secondary font-medium"
              )}
              key={n}
              onClick={() => onChange(section.key, isSelected ? undefined : n)}
              variant="ghost"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  className={cn(
                    "h-3.5 w-3.5",
                    star <= n ? "fill-star text-star" : "text-muted-foreground"
                  )}
                  key={star}
                />
              ))}
              <span className="text-muted-foreground">& up</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FilterSidebar({ title, sections, values, onChange, onClear }: FilterSidebarProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold">{title ?? "Filters"}</h2>
        <Button onClick={onClear} size="sm" variant="ghost">
          Clear All
        </Button>
      </div>

      <Separator />

      {sections.map((section, index) => (
        <div key={`${section.label}-${index}`}>
          {index > 0 && <Separator className="my-5" />}
          {section.type === "checkbox" && (
            <CheckboxSection onChange={onChange} section={section} values={values} />
          )}
          {section.type === "price-range" && (
            <PriceRangeSection onChange={onChange} section={section} values={values} />
          )}
          {section.type === "rating" && (
            <RatingSection onChange={onChange} section={section} values={values} />
          )}
        </div>
      ))}
    </div>
  );
}
