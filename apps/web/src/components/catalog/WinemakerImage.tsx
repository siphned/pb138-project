import { useGetWinemakersByIdImages } from "@/generated/hooks/useGetWinemakersByIdImages";
import { cn } from "@/lib/utils";
import { CatalogPlaceholder } from "./CatalogPlaceholder";

interface WinemakerImageProps {
  winemakerId: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

/**
 * Renders the first image attached to a winemaker via GET /winemakers/:id/images.
 * Falls back to a CatalogPlaceholder while loading or when no image is attached.
 * Per-card hook is intentional until the list endpoint exposes image URLs inline.
 */
export function WinemakerImage({
  winemakerId,
  alt,
  fallbackText,
  className,
}: WinemakerImageProps) {
  const { data, isLoading } = useGetWinemakersByIdImages(winemakerId);
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
