import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { GetShopsById200 } from "@/generated/types/GetShopsById";

interface ShopMapEmbedProps {
  address: GetShopsById200["address"];
}

interface Coords {
  lat: string;
  lon: string;
}

async function geocode(query: string): Promise<Coords> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
    { headers: { "Accept-Language": "en" } }
  );
  const data: { lat: string; lon: string }[] = await res.json();
  if (!data[0]) throw new Error("NOT_FOUND");
  return { lat: data[0].lat, lon: data[0].lon };
}

export function ShopMapEmbed({ address }: ShopMapEmbedProps) {
  const query = `${address.street} ${address.houseNumber}, ${address.city}, ${address.country}`;
  const osmSearchUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;

  const { data: coords, isError } = useQuery({
    queryFn: () => geocode(query),
    queryKey: ["osm-geocode", query],
    retry: false,
  });

  if (isError) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-2xl border bg-secondary/10">
        <a
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          href={osmSearchUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <HugeiconsIcon className="h-4 w-4" icon={ArrowUpRight01Icon} />
          View location on OpenStreetMap
        </a>
      </div>
    );
  }

  if (!coords) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  const delta = 0.01;
  const bbox = `${Number(coords.lon) - delta},${Number(coords.lat) - delta},${Number(coords.lon) + delta},${Number(coords.lat) + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lon}`;

  return (
    <div className="h-64 w-full overflow-hidden rounded-2xl border bg-muted">
      <iframe
        frameBorder="0"
        height="100%"
        scrolling="no"
        src={src}
        title="Shop Location"
        width="100%"
      />
    </div>
  );
}
