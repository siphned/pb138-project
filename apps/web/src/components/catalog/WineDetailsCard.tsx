import { Link } from "@tanstack/react-router";
import { DescriptionList, PropertyRow } from "@/components/primitives/description-list";
import { Section } from "@/components/primitives/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useGetWinemakersMe } from "@/generated/hooks/useGetWinemakersMe";
import { useGetWinesByIdImages } from "@/generated/hooks/useGetWinesByIdImages";
import type { GetWinesById200 } from "@/generated/types/GetWinesById";
import { resolveImageUrl } from "@/lib/utils";
import { CatalogPlaceholder } from "./CatalogPlaceholder";

interface WineDetailsCardProps {
  wine: GetWinesById200;
}

function WineImageCarousel({
  wineId,
  color,
  name,
}: {
  wineId: string;
  color: string;
  name: string;
}) {
  const { data: images } = useGetWinesByIdImages(wineId);
  const photos = images ?? [];

  if (photos.length === 0) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-xs">
        <CatalogPlaceholder color={color} text={name} />
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
          <CarouselItem key={img.id}>
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

export function WineDetailsCard({ wine }: WineDetailsCardProps) {
  const { data: myWinemaker } = useGetWinemakersMe({
    query: { enabled: !!wine.winemaker?.id },
  });
  const isOwner = !!myWinemaker?.id && myWinemaker.id === wine.winemaker?.id;

  return (
    <div className="space-y-8">
      <Section heading="About this wine">
        <Card variant="default">
          <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_2fr]">
            <WineImageCarousel color={wine.color} name={wine.name} wineId={wine.id} />
            <div className="space-y-6">
              <DescriptionList>
                <PropertyRow label="Color" value={wine.color} />
                <PropertyRow label="Region" value={wine.region} />
                <PropertyRow label="Vintage" value={wine.vintageYear} />
                <PropertyRow label="Alcohol" value={`${wine.alcoholContent}%`} />
                {wine.composition && <PropertyRow label="Composition" value={wine.composition} />}
              </DescriptionList>
              {wine.description && (
                <p className="text-sm leading-relaxed text-muted-foreground">{wine.description}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </Section>

      {isOwner && (
        <div className="flex flex-wrap gap-4">
          <Button render={<Link params={{ id: wine.id }} to="/wines/$id/edit" />} variant="outline">
            Edit Wine
          </Button>
        </div>
      )}
    </div>
  );
}
