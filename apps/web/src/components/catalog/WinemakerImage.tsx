import { useGetWinemakersByIdImages } from "@/generated/hooks/useGetWinemakersByIdImages";
import { EntityImage, firstImageUrl } from "./EntityImage";

interface WinemakerImageProps {
  winemakerId: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

export function WinemakerImage({ winemakerId, alt, fallbackText, className }: WinemakerImageProps) {
  const { data, isLoading } = useGetWinemakersByIdImages(winemakerId);
  return (
    <EntityImage
      alt={alt}
      className={className}
      entityType="winery"
      fallbackText={fallbackText}
      imageUrl={firstImageUrl(data)}
      isLoading={isLoading}
    />
  );
}
