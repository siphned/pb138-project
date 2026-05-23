import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { DescriptionList, PropertyRow } from "@/components/primitives/description-list";
import { Section } from "@/components/primitives/section";
import { ShowOwner } from "@/components/primitives/show-owner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { GetWinemakersById200 } from "@/generated/types/GetWinemakersById";

interface WinemakerDetailsCardProps {
  winemaker: GetWinemakersById200;
}

export function WinemakerDetailsCard({ winemaker }: WinemakerDetailsCardProps) {
  useEffect(() => {
    // @ts-expect-error - checking for BE gap
    if (import.meta.env.DEV && winemaker && !winemaker.userId && !winemaker.id) {
      // biome-ignore lint/suspicious/noConsole: intentional development diagnostic for BE gap in plan §8
      console.warn("WinemakerDetailsCard: winemaker missing both userId and id.");
    }
  }, [winemaker]);

  // @ts-expect-error - plan says userId, types say id
  const ownerUserId = winemaker.userId;

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
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm leading-relaxed text-muted-foreground">{winemaker.description}</p>
          </CardContent>
        </Card>
      </Section>

      <Section heading="Contact">
        <Card variant="default">
          <CardContent className="pt-6">
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

      <ShowOwner ownerUserId={ownerUserId}>
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
      </ShowOwner>
    </div>
  );
}
