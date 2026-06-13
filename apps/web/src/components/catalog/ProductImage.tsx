import { useGetProductsByIdImages } from "@/generated/hooks/useGetProductsByIdImages";
import { EntityImage, firstImageUrl } from "./EntityImage";

interface ProductImageProps {
  productId: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

export function ProductImage({ productId, alt, fallbackText, className }: ProductImageProps) {
  const { data, isLoading } = useGetProductsByIdImages(productId);
  return (
    <EntityImage
      alt={alt}
      className={className}
      entityType="product"
      fallbackText={fallbackText}
      imageUrl={firstImageUrl(data)}
      isLoading={isLoading}
    />
  );
}
