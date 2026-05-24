<<<<<<< HEAD
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CatalogState } from "@/components/catalog/CatalogState";
import { WineCard } from "@/components/catalog/WineCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";
import { useGetWines } from "@/generated/hooks/useGetWines";
import { EventCard } from "./-components/EventCard";
import { WinemakerCard } from "./-components/WinemakerCard";

// GetEvents200 is typed as `any` in the OpenAPI spec; track BE fix in WINE-XXX.
type EventItem = {
  id: string;
  name?: string;
  title?: string;
  description?: string | null;
  startTime?: string | Date;
  endTime?: string | Date;
  startDate?: string | Date;
  endDate?: string | Date;
  address?: { city?: string; country?: string; street?: string; houseNumber?: string } | null;
  location?: string;
  winemaker?: { id?: string; name?: string } | null;
  winemakerName?: string;
  winemakerId?: string;
  attendees?: number;
  capacity?: number;
};
=======
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
>>>>>>> origin/main

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
<<<<<<< HEAD
  const winesQuery = useGetWines();
  const eventsQuery = useGetEvents();
  const winemakersQuery = useGetWinemakers();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero />

      {/* Featured Wines Section */}
      <section className="bg-background py-16 lg:py-24">
        <div className="container mx-auto space-y-8 px-6 lg:px-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-3xl font-bold md:text-4xl">Featured Wines</h2>
              <p className="mt-2 text-muted-foreground">
                Discover exceptional wines from our independent winemakers
              </p>
            </div>
            <Link className={buttonVariants({ size: "sm", variant: "ghost" })} to="/explore">
              View all <HugeiconsIcon className="ml-2 h-4 w-4" icon={ArrowRight02Icon} />
            </Link>
          </div>

          <CatalogState
            emptyDescription="Check back soon for featured wines."
            emptyTitle="No wines available"
            isEmpty={(winesQuery.data?.length ?? 0) === 0}
            isError={winesQuery.isError}
            isLoading={winesQuery.isLoading}
            onRetry={() => winesQuery.refetch()}
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {winesQuery.isLoading
                ? [1, 2, 3, 4].map((i) => <Skeleton className="aspect-3/4" key={i} />)
                : (winesQuery.data || [])
                    .slice(0, 4)
                    .map((wine) => <WineCard key={wine.id} wine={wine} />)}
            </div>
          </CatalogState>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="bg-card py-16 lg:py-24">
        <div className="container mx-auto space-y-8 px-6 lg:px-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-3xl font-bold md:text-4xl">Upcoming Events</h2>
              <p className="mt-2 text-muted-foreground">
                Tastings, festivals, and exclusive gatherings
              </p>
            </div>
            <Link className={buttonVariants({ size: "sm", variant: "ghost" })} to="/events">
              View all <HugeiconsIcon className="ml-2 h-4 w-4" icon={ArrowRight02Icon} />
            </Link>
          </div>

          <CatalogState
            emptyDescription="Check back soon for new events."
            emptyTitle="No events available"
            isEmpty={(eventsQuery.data?.length ?? 0) === 0}
            isError={eventsQuery.isError}
            isLoading={eventsQuery.isLoading}
            onRetry={() => eventsQuery.refetch()}
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {eventsQuery.isLoading
                ? [1, 2, 3].map((i) => <Skeleton className="aspect-3/4" key={i} />)
                : (eventsQuery.data || [])
                    .slice(0, 3)
                    .map((event: EventItem) => <EventCard event={event} key={event.id} />)}
            </div>
          </CatalogState>
        </div>
      </section>

      {/* Featured Winemakers Section */}
      <section className="bg-background py-16 lg:py-24">
        <div className="container mx-auto space-y-8 px-6 lg:px-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-3xl font-bold md:text-4xl">Featured Winemakers</h2>
              <p className="mt-2 text-muted-foreground">
                Meet the passionate creators behind our finest selections
              </p>
            </div>
            <Link className={buttonVariants({ size: "sm", variant: "ghost" })} to="/explore">
              Explore <HugeiconsIcon className="ml-2 h-4 w-4" icon={ArrowRight02Icon} />
            </Link>
          </div>

          <CatalogState
            emptyDescription="Check back soon for featured winemakers."
            emptyTitle="No winemakers available"
            isEmpty={(winemakersQuery.data?.length ?? 0) === 0}
            isError={winemakersQuery.isError}
            isLoading={winemakersQuery.isLoading}
            onRetry={() => winemakersQuery.refetch()}
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {winemakersQuery.isLoading
                ? [1, 2, 3].map((i) => <Skeleton className="aspect-3/4" key={i} />)
                : (winemakersQuery.data || [])
                    .slice(0, 3)
                    .map((winemaker) => <WinemakerCard key={winemaker.id} winemaker={winemaker} />)}
            </div>
          </CatalogState>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="bg-muted py-16 lg:py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Become a Winemaker */}
            <div className="space-y-4 rounded-lg border border-border bg-background p-8">
              <h3 className="font-heading text-xl font-bold md:text-2xl">Become a Winemaker</h3>
              <p className="text-muted-foreground">
                Share your passion for wine with our community. Manage your catalog, host events,
                and connect directly with wine enthusiasts.
              </p>
              <Button variant="default">Become a Winemaker</Button>
            </div>

            {/* Open a Shop */}
            <div className="space-y-4 rounded-lg border border-border bg-background p-8">
              <h3 className="font-heading text-xl font-bold md:text-2xl">Open a Shop</h3>
              <p className="text-muted-foreground">
                Curate and sell wines from independent makers. Build your own brand and grow your
                wine retail business.
              </p>
              <Button variant="default">Open a Shop</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Hero banner with primary CTA and secondary CTA
 */
function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-24 lg:py-32">
      <div className="container mx-auto max-w-4xl space-y-8 px-6 text-center lg:px-12">
        <div className="space-y-4">
          <h1 className="font-heading text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Discover wines from independent makers
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            Connect with passionate winemakers, explore unique vintages, and join a community
            dedicated to exceptional wine.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row justify-center">
          <Button render={<Link to="/explore" />} size="lg">
            Explore Wines
          </Button>
          <Button render={<Link to="/events" />} size="lg" variant="outline">
            Browse Events
          </Button>
        </div>
      </div>
=======
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-heading font-bold">Welcome to Wine Enjoyers</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            A premium marketplace for winemakers and wine lovers. Discover, buy, and enjoy the
            finest wines from across the region.
          </p>
        </div>
      </main>
>>>>>>> origin/main
    </div>
  );
}
