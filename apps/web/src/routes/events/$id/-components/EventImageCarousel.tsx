import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useGetEventsByIdImages } from "@/generated/hooks/useGetEventsByIdImages";
import { resolveImageUrl } from "@/lib/utils";

interface EventImageCarouselProps {
  eventId: string;
  name: string;
}

export function EventImageCarousel({ eventId, name }: EventImageCarouselProps) {
  const { data: images } = useGetEventsByIdImages(eventId);
  const photos = (Array.isArray(images) ? images : []) as { id?: string; url: string }[];

  if (photos.length === 0) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-xs">
        <img
          alt={name}
          className="h-full w-full object-cover opacity-60 dark:opacity-40"
          src="/placeholders/event.webp"
        />
      </div>
    );
  }

  if (photos.length === 1) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-xs">
        <img
          alt={name}
          className="h-full w-full object-cover"
          src={resolveImageUrl(photos[0].url)}
        />
      </div>
    );
  }

  return (
    <Carousel className="w-full" opts={{ loop: true }}>
      <CarouselContent>
        {photos.map((img, i) => (
          <CarouselItem key={img.id ?? i}>
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-xs">
              <img
                alt={`${name} — ${i + 1}`}
                className="h-full w-full object-cover"
                src={resolveImageUrl(img.url)}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  );
}
