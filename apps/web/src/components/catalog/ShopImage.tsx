import { useGetShopsByIdImages } from "@/generated/hooks/useGetShopsByIdImages";
import { EntityImage, firstImageUrl } from "./EntityImage";

interface ShopImageProps {
  shopId: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

export function ShopImage({ shopId, alt, fallbackText, className }: ShopImageProps) {
  const { data, isLoading } = useGetShopsByIdImages(shopId);
  return (
    <EntityImage
      alt={alt}
      className={className}
      entityType="shop"
      fallbackText={fallbackText}
      imageUrl={firstImageUrl(data)}
      isLoading={isLoading}
    />
  );
}
