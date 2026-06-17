import { ArrowRight01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import vineyardText from "@/assets/vineyard-text.webp";
import vineyardTextDark from "@/assets/vineyard-text_darkmode.webp";
import { Button } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section
      className="rounded-3xl bg-secondary/80 px-6 py-16 text-center md:px-12 md:py-24"
      data-slot="home-hero"
    >
      <div className="relative mx-auto w-fit">
        <h1
          className="mx-auto max-w-4xl bg-[image:var(--hero-text-light)] bg-[position:50%_62%] bg-cover bg-clip-text font-heading text-5xl font-black uppercase leading-[0.95] tracking-tight text-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] md:text-7xl lg:text-9xl dark:bg-[image:var(--hero-text-dark)]"
          style={
            {
              "--hero-text-dark": `url(${vineyardTextDark})`,
              "--hero-text-light": `linear-gradient(rgba(140,28,48,0.18), rgba(60,16,26,0.04)), url(${vineyardText})`,
            } as CSSProperties
          }
        >
          Wine just for you
        </h1>
      </div>
      <p
        className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-2xl"
        data-slot="home-hero-tagline"
      >
        Browse cellars, meet the winemakers behind each bottle, and book tastings without leaving
        the couch.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button render={<Link to="/wines" />} size="lg">
          Explore wines
          <HugeiconsIcon className="ml-2 h-4 w-4" icon={ArrowRight01Icon} />
        </Button>
        <Button render={<Link to="/events" />} size="lg" variant="outline">
          <HugeiconsIcon className="mr-2 h-4 w-4" icon={Calendar03Icon} />
          Upcoming events
        </Button>
      </div>
    </section>
  );
}
