import type { GetShopsById200 } from "@/generated/types/GetShopsById";

interface ShopMapEmbedProps {
  address: GetShopsById200["address"];
}

export function ShopMapEmbed({ address }: ShopMapEmbedProps) {
  // Since we can't geocode easily without an API key, we'll use a simple OSM embed
  // This is a placeholder for a real map implementation
  const query = encodeURIComponent(`${address.city}, ${address.country}`);
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=16.55%2C49.15%2C16.65%2C49.25&layer=mapnik&q=${query}`;

  return (
    <div className="h-64 w-full overflow-hidden rounded-2xl border bg-muted">
      <iframe
        frameBorder="0"
        height="100%"
        marginHeight={0}
        marginWidth={0}
        scrolling="no"
        src={src}
        title="Shop Location"
        width="100%"
      />
    </div>
  );
}
