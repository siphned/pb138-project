import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HomeFeaturedEvents } from "@/components/home/HomeFeaturedEvents";
import { HomeFeaturedWinemakers } from "@/components/home/HomeFeaturedWinemakers";
import { HomeFeaturedWines } from "@/components/home/HomeFeaturedWines";
import { HomeHero } from "@/components/home/HomeHero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { user } = useUser();
  const ctaHref = user ? "/dashboard" : "/auth/register";
  const ctaLabel = user ? "Go to your dashboard" : "Become a vendor";
  const ctaCopy = user
    ? "Manage your shop, catalog, and events from the dashboard."
    : "Sell your wines or run tastings. Apply for a winemaker or shop owner account.";

  return (
    <div className="container mx-auto space-y-16 px-6 py-8 lg:px-12">
      <HomeHero />

      <HomeFeaturedWines />
      <HomeFeaturedWinemakers />
      <HomeFeaturedEvents />

      <Card className="flex flex-col items-center gap-4 p-10 text-center" variant="section">
        <h2 className="font-heading text-2xl font-bold text-foreground">Sell on WineMarket</h2>
        <p className="max-w-2xl text-muted-foreground">{ctaCopy}</p>
        <Button render={<Link to={ctaHref} />} size="lg">
          {ctaLabel}
          <HugeiconsIcon className="ml-2 h-4 w-4" icon={ArrowRight01Icon} />
        </Button>
      </Card>
    </div>
  );
}
