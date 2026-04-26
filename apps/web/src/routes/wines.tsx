import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { WineCatalog } from "./-components/WineCatalog";

const winesSearchSchema = z.object({
  search: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  type: z.string().optional(),
  region: z.string().optional(),
  rating: z.number().optional(),
  sort: z.string().optional().default("newest"),
  page: z.number().optional().default(1),
});

export const Route = createFileRoute("/wines")({
  validateSearch: (search) => winesSearchSchema.parse(search),
  component: WinesPage,
});

function WinesPage() {
  const search = Route.useSearch();
  return <WineCatalog search={search} />;
}
