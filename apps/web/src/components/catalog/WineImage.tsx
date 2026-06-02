import { useGetWinesByIdImages } from "@/generated/hooks/useGetWinesByIdImages";
import { EntityImage } from "./EntityImage";

interface WineImageProps {
  wineId: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

/** Thin wrapper around `<EntityImage>` for wine images. */
export function WineImage({ wineId, alt, fallbackText, className }: WineImageProps) {
  const imagesQuery = useGetWinesByIdImages(wineId);
  return (
    <EntityImage
      alt={alt}
      className={className}
      entityType="wine"
      fallbackText={fallbackText}
      imagesQuery={imagesQuery}
    />
  );
}
