import { createFileRoute } from "@tanstack/react-router";
import { HomeFeaturedEvents } from "@/routes/-components/HomeFeaturedEvents";
import { HomeFeaturedWinemakers } from "@/routes/-components/HomeFeaturedWinemakers";
import { HomeFeaturedWines } from "@/routes/-components/HomeFeaturedWines";
import { HomeHero } from "@/routes/-components/HomeHero";
import { HomeSellCta } from "@/routes/-components/HomeSellCta";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="container mx-auto space-y-16 px-6 py-8 lg:px-12">
      <HomeHero />

      <HomeFeaturedWines />
      <HomeFeaturedWinemakers />
      <HomeFeaturedEvents />

      <HomeSellCta />
    </div>
  );
}
