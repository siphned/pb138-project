import { useGetProductsByIdImages } from "@/generated/hooks/useGetProductsByIdImages";
import { cn } from "@/lib/utils";
import { CatalogPlaceholder } from "./CatalogPlaceholder";

interface ProductImageProps {
  productId: string;
  alt: string;
  fallbackText: string;
  fallbackColor?: string;
  className?: string;
}

/**
 * Renders the first image attached to a product via GET /products/:id/images.
 * Falls back to a coloured CatalogPlaceholder while loading or when no image
 * is attached. Per-card hook is intentional until the list endpoint exposes
 * image URLs inline.
 */
export function ProductImage({
  productId,
  alt,
  fallbackText,
  fallbackColor,
  className,
}: ProductImageProps) {
  const { data, isLoading } = useGetProductsByIdImages(productId);
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

  return <CatalogPlaceholder color={fallbackColor} text={fallbackText} />;
}
