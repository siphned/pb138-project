import { useGetEventsByIdImages } from "@/generated/hooks/useGetEventsByIdImages";
import { EntityImage, firstImageUrl } from "./EntityImage";

interface EventImageProps {
  eventId: string;
  alt: string;
  fallbackText: string;
  className?: string;
  imageUrl?: string | null;
}

export function EventImage({ eventId, alt, fallbackText, className, imageUrl }: EventImageProps) {
  const hasInlineUrl = imageUrl !== undefined;
  const { data, isLoading } = useGetEventsByIdImages(eventId, {
    query: { enabled: !hasInlineUrl },
  });
  return (
    <EntityImage
      alt={alt}
      className={className}
      entityType="event"
      fallbackText={fallbackText}
      imageUrl={hasInlineUrl ? imageUrl : firstImageUrl(data)}
      isLoading={!hasInlineUrl && isLoading}
    />
  );
}
