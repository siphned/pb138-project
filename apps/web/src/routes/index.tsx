import { ArrowRight02Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CatalogState } from "@/components/catalog/CatalogState";
import { WineCard } from "@/components/catalog/WineCard";
import { WinemakerCard } from "@/components/catalog/WinemakerCard";
import { DataGrid } from "@/components/primitives/data-grid";
import { Button } from "@/components/ui/button";
import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";
import { useGetWines } from "@/generated/hooks/useGetWines";
import { EventCard } from "./-components/EventCard";

export const Route = createFileRoute("/")({
  component: HomePage,
});

type EventLike = {
  id: string;
  name?: string;
  title?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  startDate?: string | Date;
  endDate?: string | Date;
  address?: { city?: string; country?: string } | null;
  location?: string;
  winemaker?: { id?: string; name?: string } | null;
  winemakerName?: string;
  attendees?: number;
  capacity?: number;
};

function SectionHeader({
  title,
  description,
  linkTo,
  linkLabel,
}: {
  title: string;
  description?: string;
  linkTo: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <Link
        className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
        to={linkTo}
      >
        {linkLabel}
        <HugeiconsIcon className="h-4 w-4" icon={ArrowRight02Icon} />
      </Link>
    </div>
  );
}

function FeaturedWines() {
  const { data, isLoading, isError, refetch } = useGetWines();
  const wines = Array.isArray(data) ? data.slice(0, 6) : [];

  return (
    <section className="space-y-6">
      <SectionHeader
        description="Explore our curated selection of wines from top winemakers."
        linkLabel="Browse all wines"
        linkTo="/explore"
        title="Featured Wines"
      />
      <CatalogState
        emptyDescription="Check back soon for new wines."
        emptyTitle="No wines yet"
        isEmpty={!isLoading && wines.length === 0}
        isError={isError}
        isLoading={isLoading}
        onRetry={() => refetch()}
      >
        <DataGrid variant="catalog">
          {wines.map((wine) => (
            <WineCard key={wine.id} wine={wine} />
          ))}
        </DataGrid>
      </CatalogState>
    </section>
  );
}

function FeaturedWinemakers() {
  const { data, isLoading, isError, refetch } = useGetWinemakers();
  const winemakers = Array.isArray(data) ? data.slice(0, 4) : [];

  return (
    <section className="space-y-6">
      <SectionHeader
        description="Meet the passionate artisans behind every bottle."
        linkLabel="Meet all winemakers"
        linkTo="/winemakers"
        title="Featured Winemakers"
      />
      <CatalogState
        emptyDescription="Winemakers will appear here once they join the platform."
        emptyTitle="No winemakers yet"
        isEmpty={!isLoading && winemakers.length === 0}
        isError={isError}
        isLoading={isLoading}
        onRetry={() => refetch()}
      >
        <DataGrid variant="catalog">
          {winemakers.map((winemaker) => (
            <WinemakerCard key={winemaker.id} winemaker={winemaker} />
          ))}
        </DataGrid>
      </CatalogState>
    </section>
  );
}

function UpcomingEvents() {
  const { data, isLoading, isError, refetch } = useGetEvents({ limit: 3 });
  const raw = data as EventLike[] | { data?: EventLike[] } | undefined;
  const events = Array.isArray(raw) ? raw.slice(0, 3) : (raw?.data ?? []).slice(0, 3);

  return (
    <section className="space-y-6">
      <SectionHeader
        description="Tastings, festivals, and exclusive gatherings from our winemakers."
        linkLabel="View all events"
        linkTo="/events"
        title="Upcoming Events"
      />
      <CatalogState
        emptyDescription="Events will be announced soon."
        emptyTitle="No upcoming events"
        isEmpty={!isLoading && events.length === 0}
        isError={isError}
        isLoading={isLoading}
        onRetry={() => refetch()}
      >
        <DataGrid variant="catalog">
          {events.map((event) => (
            <EventCard event={event} key={event.id} />
          ))}
        </DataGrid>
      </CatalogState>
    </section>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-muted px-8 py-16 text-center md:px-16 md:py-24">
      <div className="relative mx-auto max-w-2xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <HugeiconsIcon className="h-4 w-4" icon={UserGroupIcon} />
          Multi-vendor wine marketplace
        </div>
        <h1 className="text-4xl font-bold leading-tight md:text-5xl">
          Discover exceptional wines from passionate winemakers
        </h1>
        <p className="text-lg text-muted-foreground">
          Browse artisan wines, attend exclusive events, and connect with the winemakers behind
          every bottle.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button render={<Link to="/explore" />} size="lg">
            Explore Wines
          </Button>
          <Button render={<Link to="/events" />} size="lg" variant="outline">
            View Events
          </Button>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <div className="container mx-auto space-y-16 px-6 py-8 lg:px-12">
      <Hero />
      <FeaturedWines />
      <FeaturedWinemakers />
      <UpcomingEvents />
    </div>
  );
}
