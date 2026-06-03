import { useGetEventsByIdImages } from "@/generated/hooks/useGetEventsByIdImages";
import { EntityImage, firstImageUrl } from "./EntityImage";

interface EventImageProps {
  eventId: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

export function EventImage({ eventId, alt, fallbackText, className }: EventImageProps) {
  const { data, isLoading } = useGetEventsByIdImages(eventId);
  return (
    <EntityImage
      alt={alt}
      className={className}
      entityType="event"
      fallbackText={fallbackText}
      imageUrl={firstImageUrl(data)}
      isLoading={isLoading}
    />
  );
}
