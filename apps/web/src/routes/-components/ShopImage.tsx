import { useGetShopsByIdImages } from "@/generated/hooks/useGetShopsByIdImages";
import { EntityImage, firstImageUrl } from "@/routes/-components/EntityImage";

interface ShopImageProps {
  shopId: string;
  alt: string;
  fallbackText: string;
  className?: string;
  imageUrl?: string | null;
}

export function ShopImage({ shopId, alt, fallbackText, className, imageUrl }: ShopImageProps) {
  const hasInlineUrl = imageUrl !== undefined;
  const { data, isLoading } = useGetShopsByIdImages(shopId, {
    query: { enabled: !hasInlineUrl },
  });
  return (
    <EntityImage
      alt={alt}
      className={className}
      entityType="shop"
      fallbackText={fallbackText}
      imageUrl={hasInlineUrl ? imageUrl : firstImageUrl(data)}
      isLoading={!hasInlineUrl && isLoading}
    />
  );
}
