import { useGetWinesByIdImages } from "@/generated/hooks/useGetWinesByIdImages";
import { EntityImage, firstImageUrl } from "./EntityImage";

interface WineImageProps {
  wineId: string;
  alt: string;
  fallbackText: string;
  className?: string;
  imageUrl?: string | null;
}

export function WineImage({ wineId, alt, fallbackText, className, imageUrl }: WineImageProps) {
  const hasInlineUrl = imageUrl !== undefined;
  const { data, isLoading } = useGetWinesByIdImages(wineId, {
    query: { enabled: !hasInlineUrl },
  });
  return (
    <EntityImage
      alt={alt}
      className={className}
      entityType="wine"
      fallbackText={fallbackText}
      imageUrl={hasInlineUrl ? imageUrl : firstImageUrl(data)}
      isLoading={!hasInlineUrl && isLoading}
    />
  );
}
