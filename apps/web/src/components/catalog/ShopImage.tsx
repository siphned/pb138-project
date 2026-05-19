import { useGetShopsByIdImages } from "@/generated/hooks/useGetShopsByIdImages";
import { cn } from "@/lib/utils";
import { CatalogPlaceholder } from "./CatalogPlaceholder";

interface ShopImageProps {
  shopId: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

/**
 * Renders the first image attached to a shop via GET /shops/:id/images.
 * Falls back to a CatalogPlaceholder while loading or when no image is attached.
 * Per-card hook is intentional until the list endpoint exposes image URLs inline.
 */
export function ShopImage({ shopId, alt, fallbackText, className }: ShopImageProps) {
  const { data, isLoading } = useGetShopsByIdImages(shopId);
  const url = !isLoading && Array.isArray(data) ? data[0]?.url : undefined;

  if (url) {
    return (
      <img
        alt={alt}
        className={cn(
          "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
          className
        )}
        src={url}
      />
    );
  }

  return <CatalogPlaceholder text={fallbackText} />;
}
