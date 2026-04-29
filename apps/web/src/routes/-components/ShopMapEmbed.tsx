import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import type { GetShopsById200 } from "@/generated/types/GetShopsById";

interface ShopMapEmbedProps {
  address: GetShopsById200["address"];
}

interface Coords {
  lat: string;
  lon: string;
}

export function ShopMapEmbed({ address }: ShopMapEmbedProps) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [failed, setFailed] = useState(false);

  const query = `${address.street} ${address.houseNumber}, ${address.city}, ${address.country}`;
  const osmSearchUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;

  useEffect(() => {
    const controller = new AbortController();
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { "Accept-Language": "en" }, signal: controller.signal }
    )
      .then((r) => r.json())
      .then((data: { lat: string; lon: string }[]) => {
        if (data[0]) {
          setCoords({ lat: data[0].lat, lon: data[0].lon });
        } else {
          setFailed(true);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setFailed(true);
      });

    return () => controller.abort();
  }, [query]);

  if (failed) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-2xl border bg-secondary/10">
        <a
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          href={osmSearchUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <ExternalLink className="h-4 w-4" />
          View location on OpenStreetMap
        </a>
      </div>
    );
  }

  if (!coords) {
    return <div className="h-64 w-full animate-pulse rounded-2xl bg-secondary/20" />;
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
