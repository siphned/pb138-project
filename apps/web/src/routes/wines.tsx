import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { WineCatalog } from "./-components/WineCatalog";

const winesSearchSchema = z.object({
  maxPrice: z.number().optional(),
  minPrice: z.number().optional(),
  page: z.number().optional().default(1),
  rating: z.number().optional(),
  region: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional().default("newest"),
  type: z.string().optional(),
});

export const Route = createFileRoute("/wines")({
  component: WinesPage,
  validateSearch: (search) => winesSearchSchema.parse(search),
});

function WinesPage() {
  const search = Route.useSearch();
  return <WineCatalog search={search} />;
}
