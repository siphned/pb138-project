import { useGetEventsByIdImages } from "@/generated/hooks/useGetEventsByIdImages";
import { EntityImage } from "./EntityImage";

interface EventImageProps {
  eventId: string;
  alt: string;
  fallbackText: string;
  className?: string;
}

/** Thin wrapper around `<EntityImage>` for event images. */
export function EventImage({ eventId, alt, fallbackText, className }: EventImageProps) {
  const imagesQuery = useGetEventsByIdEventsIdImages(eventId);
  return (
    <EntityImage
      alt={alt}
      className={className}
      entityType="event"
      fallbackText={fallbackText}
      imagesQuery={imagesQuery}
    />
  );
}

