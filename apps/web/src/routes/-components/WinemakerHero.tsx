import { Globe, Mail, MapPin, Phone } from "lucide-react";
import type { GetWinemakersById200 } from "@/generated/types/GetWinemakersById";

interface WinemakerHeroProps {
  winemaker: GetWinemakersById200;
}

export function WinemakerHero({ winemaker }: WinemakerHeroProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl font-bold lg:text-5xl">{winemaker.name}</h1>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            {winemaker.address.city}, {winemaker.address.country}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-heading text-xl font-bold">About the Winemaker</h3>
          <p className="text-muted-foreground leading-relaxed">
            {winemaker.description || "No description available yet."}
          </p>
        </div>

        <div className="space-y-4 rounded-2xl bg-secondary/10 p-6">
          <h3 className="font-heading text-xl font-bold">Contact Details</h3>
          <div className="space-y-3 text-sm">
            {winemaker.websiteUrl && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-primary" />
                <a
                  className="hover:underline"
                  href={winemaker.websiteUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {winemaker.websiteUrl.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary" />
              <span>{winemaker.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary" />
              <span>{winemaker.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
