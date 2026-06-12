import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import sellBanner from "@/assets/sell-on-winemarket.webp";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";

export function HomeSellCta() {
  const { user } = useUser();
  const ctaHref = user ? "/dashboard" : "/auth/register";
  const ctaLabel = user ? "Go to your dashboard" : "Become a vendor";
  const ctaCopy = user
    ? "Manage your shop, catalog, and events from the dashboard."
    : "Sell your wines or run tastings. Apply for a winemaker or shop owner account.";

  return (
    <Card
      className="relative isolate flex flex-col items-center gap-4 p-10 text-center md:p-16"
      variant="section"
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        <img alt="" className="h-full w-full object-cover" src={sellBanner} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/70 to-black/55" />
      </div>
      <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">Sell on WineMarket</h2>
      <p className="max-w-2xl text-white/85">{ctaCopy}</p>
      <Button render={<Link to={ctaHref} />} size="lg">
        {ctaLabel}
        <HugeiconsIcon className="ml-2 h-4 w-4" icon={ArrowRight01Icon} />
      </Button>
    </Card>
  );
}
