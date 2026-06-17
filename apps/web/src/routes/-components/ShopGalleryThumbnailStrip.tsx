import { Button } from "@/components/ui/button";
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
        <Button
          className={cn(
            "h-20 shrink-0 overflow-hidden rounded-lg border-2 bg-muted p-0",
            i === selectedIndex
              ? "border-foreground/40"
              : "border-transparent opacity-70 hover:opacity-100"
          )}
          key={src}
          onClick={() => onSelect(i)}
          variant="ghost"
        >
          <img alt={`Shop ${i + 1}`} className="h-full w-full object-cover" src={src} />
        </Button>
      ))}
    </div>
  );
}
