import { ArrowRight01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import vineyardText from "@/assets/vineyard-text.webp";
import { Button } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section
      className="rounded-3xl bg-secondary/20 px-6 py-16 text-center md:px-12 md:py-24"
      data-slot="home-hero"
    >
      <h1
        className="mx-auto max-w-4xl bg-[position:50%_62%] bg-cover bg-clip-text font-heading text-5xl font-black uppercase leading-[0.95] tracking-tight text-transparent drop-shadow-sm md:text-7xl lg:text-9xl"
        style={{
          backgroundImage: `linear-gradient(rgba(24,10,14,0.45), rgba(24,10,14,0.1)), url(${vineyardText})`,
        }}
      >
        Wine just for you
      </h1>
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
