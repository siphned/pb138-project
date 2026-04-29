import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { WineCatalog } from "./-components/WineCatalog";

const bundlesSearchSchema = z.object({
  maxPrice: z.number().optional(),
  minPrice: z.number().optional(),
  page: z.number().optional().default(1),
  rating: z.number().optional(),
  search: z.string().optional(),
  sort: z.string().optional().default("newest"),
});

export const Route = createFileRoute("/bundles")({
  component: BundlesPage,
  validateSearch: (search) => bundlesSearchSchema.parse(search),
});

function BundlesPage() {
  const search = Route.useSearch();
  return <WineCatalog mode="bundles" search={search} />;
}
