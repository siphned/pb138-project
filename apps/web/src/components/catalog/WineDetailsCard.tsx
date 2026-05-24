import { Link } from "@tanstack/react-router";
import { DescriptionList, PropertyRow } from "@/components/primitives/description-list";
import { Section } from "@/components/primitives/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetWinemakersMe } from "@/generated/hooks/useGetWinemakersMe";
import type { GetWinesById200 } from "@/generated/types/GetWinesById";

interface WineDetailsCardProps {
  wine: GetWinesById200;
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
          <CardContent className="space-y-6">
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
