import { useGetShopsByIdImages } from "@/generated/hooks/useGetShopsByIdImages";
import { EntityImage } from "./EntityImage";

interface ShopImageProps {
  shopId: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

/** Thin wrapper around `<EntityImage>` for shop images. */
export function ShopImage({ shopId, alt, fallbackText, className }: ShopImageProps) {
  const imagesQuery = useGetShopsByIdImages(shopId);
  return (
    <EntityImage
      alt={alt}
      className={className}
      entityType="shop"
      fallbackText={fallbackText}
      imagesQuery={imagesQuery}
    />
  );
}
