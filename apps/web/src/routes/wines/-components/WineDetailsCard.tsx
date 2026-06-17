import { Link } from "@tanstack/react-router";
import { DescriptionList, PropertyRow } from "@/components/primitives/description-list";
import { Section } from "@/components/primitives/section";
import { Card, CardContent } from "@/components/ui/card";
import type { GetWinesById200 } from "@/generated/types/GetWinesById";

interface WineDetailsCardProps {
  wine: GetWinesById200;
}

export function WineDetailsCard({ wine }: WineDetailsCardProps) {
  return (
    <div className="space-y-8">
      <Section heading="About this wine">
        <Card variant="default">
          <CardContent>
            <div className="space-y-6">
              <DescriptionList>
                {wine.winemaker?.id && wine.winemaker.name && (
                  <PropertyRow
                    label="Winemaker"
                    value={
                      <Link
                        className="text-primary hover:underline"
                        params={{ id: wine.winemaker.id }}
                        to="/winemakers/$id"
                      >
                        {wine.winemaker.name}
                      </Link>
                    }
                  />
                )}
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
    </div>
  );
}
