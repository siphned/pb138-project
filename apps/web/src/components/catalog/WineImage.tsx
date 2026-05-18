import { useGetWinesByIdImages } from "@/generated/hooks/useGetWinesByIdImages";
import { cn } from "@/lib/utils";
import { CatalogPlaceholder } from "./CatalogPlaceholder";

interface WineImageProps {
  wineId: string;
  alt: string;
  fallbackText: string;
  fallbackColor?: string;
  className?: string;
}

/**
 * Renders the first image attached to a wine via GET /wines/:id/images.
 * Falls back to a coloured CatalogPlaceholder while loading or when no image
 * is attached. Per-card hook is intentional until the list endpoint exposes
 * image URLs inline.
 */
export function WineImage({
  wineId,
  alt,
  fallbackText,
  fallbackColor,
  className,
}: WineImageProps) {
  const { data, isLoading } = useGetWinesByIdImages(wineId);
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
