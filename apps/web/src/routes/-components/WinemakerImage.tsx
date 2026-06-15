import { useGetWinemakersByIdImages } from "@/generated/hooks/useGetWinemakersByIdImages";
import { EntityImage, firstImageUrl } from "@/routes/-components/EntityImage";

interface WinemakerImageProps {
  winemakerId: string;
  alt: string;
  fallbackText: string;
  className?: string;
  imageUrl?: string | null;
}

export function WinemakerImage({
  winemakerId,
  alt,
  fallbackText,
  className,
  imageUrl,
}: WinemakerImageProps) {
  const hasInlineUrl = imageUrl !== undefined;
  const { data, isLoading } = useGetWinemakersByIdImages(winemakerId, {
    query: { enabled: !hasInlineUrl },
  });
  return (
    <EntityImage
      alt={alt}
      className={className}
      entityType="winery"
      fallbackText={fallbackText}
      imageUrl={hasInlineUrl ? imageUrl : firstImageUrl(data)}
      isLoading={!hasInlineUrl && isLoading}
    />
  );
}
