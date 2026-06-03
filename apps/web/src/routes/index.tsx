import { createFileRoute } from "@tanstack/react-router";
import { HomeFeaturedEvents } from "@/components/home/HomeFeaturedEvents";
import { HomeFeaturedWinemakers } from "@/components/home/HomeFeaturedWinemakers";
import { HomeFeaturedWines } from "@/components/home/HomeFeaturedWines";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeSellCta } from "@/components/home/HomeSellCta";

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
