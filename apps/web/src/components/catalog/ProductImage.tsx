import { useGetProductsByIdImages } from "@/generated/hooks/useGetProductsByIdImages";
import { EntityImage } from "./EntityImage";

interface ProductImageProps {
  productId: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

/** Thin wrapper around `<EntityImage>` for product images. */
export function ProductImage({ productId, alt, fallbackText, className }: ProductImageProps) {
  const imagesQuery = useGetProductsByIdImages(productId);
  return (
    <EntityImage
      alt={alt}
      className={className}
      entityType="product"
      fallbackText={fallbackText}
      imagesQuery={imagesQuery}
    />
  );
}
