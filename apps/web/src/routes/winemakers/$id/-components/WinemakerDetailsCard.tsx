import { Link } from "@tanstack/react-router";
import { DescriptionList, PropertyRow } from "@/components/primitives/description-list";
import { Section } from "@/components/primitives/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { GetWinemakersById200 } from "@/generated/types/GetWinemakersById";

interface WinemakerDetailsCardProps {
  winemaker: GetWinemakersById200;
  canManage: boolean;
}

export function WinemakerDetailsCard({ winemaker, canManage }: WinemakerDetailsCardProps) {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-4xl font-bold lg:text-5xl">{winemaker.name}</h1>
        <p className="text-muted-foreground">
          {[winemaker.address.city, winemaker.address.country].filter(Boolean).join(", ")}
        </p>
      </header>

      <Section heading="About">
        <Card variant="default">
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{winemaker.description}</p>
          </CardContent>
        </Card>
      </Section>

      <Section heading="Contact">
        <Card variant="default">
          <CardContent>
            <DescriptionList>
              {winemaker.email && <PropertyRow label="Email" value={winemaker.email} />}
              {winemaker.phone && <PropertyRow label="Phone" value={winemaker.phone} />}
              {winemaker.websiteUrl && (
                <PropertyRow
                  label="Website"
                  value={
                    <a
                      className="text-primary hover:underline"
                      href={winemaker.websiteUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {winemaker.websiteUrl.replace(/^https?:\/\//, "")}
                    </a>
                  }
                />
              )}
              <PropertyRow
                label="Location"
                value={`${winemaker.address.city}, ${winemaker.address.country}`}
              />
            </DescriptionList>
          </CardContent>
        </Card>
      </Section>

      {canManage && (
        <div className="flex flex-wrap gap-4">
          <Button
            render={<Link params={{ id: winemaker.id }} to="/winemakers/$id/edit" />}
            variant="outline"
          >
            Edit Profile
          </Button>
          <Button
            render={<Link params={{ id: winemaker.id }} to="/winemakers/$id/images" />}
            variant="outline"
          >
            Manage Images
          </Button>
        </div>
      )}
    </div>
  );
}
