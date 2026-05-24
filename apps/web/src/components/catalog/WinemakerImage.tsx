import { useGetWinemakersByIdImages } from "@/generated/hooks/useGetWinemakersByIdImages";
import { EntityImage } from "./EntityImage";

interface WinemakerImageProps {
  winemakerId: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

/** Thin wrapper around `<EntityImage>` for winemaker images. */
export function WinemakerImage({ winemakerId, alt, fallbackText, className }: WinemakerImageProps) {
  const imagesQuery = useGetWinemakersByIdImages(winemakerId);
  return (
    <EntityImage
      alt={alt}
      className={className}
      fallbackText={fallbackText}
      imagesQuery={imagesQuery}
    />
  );
}
