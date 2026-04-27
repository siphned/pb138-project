import { useNavigate } from "@tanstack/react-router";
import type { FilterSection } from "@/components/catalog/FilterSidebar";
import { FilterSidebar } from "@/components/catalog/FilterSidebar";

const WINE_FILTERS: FilterSection[] = [
  {
    key: "type",
    label: "Wine Type",
    options: [
      { id: "red", label: "Red Wine" },
      { id: "white", label: "White Wine" },
      { id: "rosé", label: "Rosé Wine" },
      { id: "sparkling", label: "Sparkling" },
      { id: "dessert", label: "Dessert Wine" },
    ],
    type: "checkbox",
  },
  {
    label: "Price Range",
    maxKey: "maxPrice",
    minKey: "minPrice",
    type: "price-range",
  },
  {
    key: "rating",
    label: "Rating",
    type: "rating",
  },
  {
    key: "region",
    label: "Region",
    options: [
      { id: "France", label: "France" },
      { id: "Italy", label: "Italy" },
      { id: "Spain", label: "Spain" },
      { id: "Moravia", label: "Moravia" },
      { id: "Austria", label: "Austria" },
    ],
    type: "checkbox",
  },
];

interface WineFiltersSidebarProps {
  search: {
    maxPrice?: number;
    minPrice?: number;
    page?: number;
    rating?: number;
    region?: string[];
    search?: string;
    sort?: string;
    type?: string[];
  };
}

export function WineFiltersSidebar({ search }: WineFiltersSidebarProps) {
  const navigate = useNavigate();

  const handleChange = (key: string, value: unknown) => {
    navigate({
      search: { ...(search as Record<string, unknown>), [key]: value, page: 1 },
      to: "/wines",
    });
  };

  const handleClear = () => {
    navigate({ search: { page: 1, sort: "newest" }, to: "/wines" });
  };

  return (
    <FilterSidebar
      onChange={handleChange}
      onClear={handleClear}
      sections={WINE_FILTERS}
      values={search as Record<string, unknown>}
    />
  );
}
