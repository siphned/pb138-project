import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { DescriptionList, PropertyRow } from "@/components/primitives/description-list";
import { Section } from "@/components/primitives/section";
import { ShowOwner } from "@/components/primitives/show-owner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { GetWinesById200 } from "@/generated/types/GetWinesById";

interface WineDetailsCardProps {
  wine: GetWinesById200;
}

export function WineDetailsCard({ wine }: WineDetailsCardProps) {
  useEffect(() => {
    // @ts-expect-error - checking for BE gap mentioned in plan §8
    if (import.meta.env.DEV && wine.winemaker && !wine.winemaker.userId && !wine.winemaker.id) {
      // biome-ignore lint/suspicious/noConsole: intentional warning for BE gap mentioned in plan §8
      console.warn(
        "WineDetailsCard: winemaker object missing both userId and id. Owner gating may fail."
      );
    }
  }, [wine.winemaker]);

  // @ts-expect-error - plan §8 says we might need userId, but generated types only have id
  const ownerUserId = wine.winemaker?.userId;

  return (
    <div className="space-y-8">
      <Section heading="About this wine">
        <Card variant="default">
          <CardContent className="space-y-6 pt-6">
            <DescriptionList>
              <PropertyRow label="Color" value={wine.color} />
              <PropertyRow label="Region" value={wine.region} />
              <PropertyRow label="Vintage" value={String(wine.vintageYear)} />
              <PropertyRow label="Alcohol" value={`${wine.alcoholContent}%`} />
              {wine.composition && <PropertyRow label="Composition" value={wine.composition} />}
            </DescriptionList>
            {wine.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">{wine.description}</p>
            )}
          </CardContent>
        </Card>
      </Section>

      <ShowOwner ownerUserId={ownerUserId}>
        <div className="flex flex-wrap gap-4">
          <Button render={<Link params={{ id: wine.id }} to="/wines/$id/edit" />} variant="outline">
            Edit Wine
          </Button>
          <Button disabled variant="destructive">
            Delete Wine
          </Button>
        </div>
      </ShowOwner>
    </div>
  );
}
