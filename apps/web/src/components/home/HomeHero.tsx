import { ArrowRight01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section
      className="rounded-3xl bg-secondary/20 px-6 py-16 text-center md:px-12 md:py-24"
      data-slot="home-hero"
    >
      <h1 className="mx-auto max-w-3xl font-heading text-4xl font-bold tracking-tight text-foreground md:text-6xl">
        Discover artisan wines from independent producers
      </h1>
      <p
        className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg"
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
