import { useGetWinesByIdImages } from "@/generated/hooks/useGetWinesByIdImages";
import { EntityImage, firstImageUrl } from "./EntityImage";

interface WineImageProps {
  wineId: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

export function WineImage({ wineId, alt, fallbackText, className }: WineImageProps) {
  const { data, isLoading } = useGetWinesByIdImages(wineId);
  return (
    <EntityImage
      alt={alt}
      className={className}
      entityType="wine"
      fallbackText={fallbackText}
      imageUrl={firstImageUrl(data)}
      isLoading={isLoading}
    />
  );
}
