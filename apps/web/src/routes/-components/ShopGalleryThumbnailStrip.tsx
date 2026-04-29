import { cn } from "@/lib/utils";

interface ShopGalleryThumbnailStripProps {
  images: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function ShopGalleryThumbnailStrip({
  images,
  selectedIndex,
  onSelect,
}: ShopGalleryThumbnailStripProps) {
  return (
    <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {images.map((src, i) => (
        <button
          className={cn(
            "h-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            i === selectedIndex
              ? "border-primary"
              : "border-transparent opacity-70 hover:opacity-100"
          )}
          key={src}
          onClick={() => onSelect(i)}
          type="button"
        >
          <img alt={`Shop ${i + 1}`} className="h-full w-full object-cover" src={src} />
        </button>
      ))}
    </div>
  );
}
