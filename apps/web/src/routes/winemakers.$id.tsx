<<<<<<< HEAD
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CatalogState } from "@/components/catalog/CatalogState";
import { WineCard } from "@/components/catalog/WineCard";
import { WinemakerDetailsCard } from "@/components/catalog/WinemakerDetailsCard";
import { DataGrid } from "@/components/primitives/data-grid";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { Section } from "@/components/primitives/section";
import { Separator } from "@/components/ui/separator";
import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { useGetWinemakersById } from "@/generated/hooks/useGetWinemakersById";
import { useGetWines } from "@/generated/hooks/useGetWines";
import { EntityReviewsSection } from "./-components/EntityReviewsSection";
import { EventCard } from "./-components/EventCard";
=======
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Separator } from "@/components/ui/separator";
import { useGetWinemakersById } from "@/generated/hooks/useGetWinemakersById";
import { WinemakerHero } from "./-components/WinemakerHero";
import { WinemakerWinesList } from "./-components/WinemakerWinesList";
>>>>>>> origin/main

export const Route = createFileRoute("/winemakers/$id")({
  component: WinemakerProfilePage,
});

function WinemakerProfilePage() {
  const { id } = Route.useParams();
  const { data: winemaker, isLoading, isError, refetch } = useGetWinemakersById(id);
<<<<<<< HEAD
  const winesQuery = useGetWines({ winemakerId: id });
  const eventsQuery = useGetEvents(
    { winemakerName: winemaker?.name },
    { query: { enabled: !!winemaker?.name } }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <LoadingState variant="detail" />
      </div>
=======

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-6 py-8 lg:px-12 space-y-8">
          <div className="h-6 w-32 animate-pulse rounded-md bg-secondary/20" />
          <div className="space-y-6">
            <div className="h-12 w-1/2 animate-pulse rounded-md bg-secondary/20" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-40 animate-pulse rounded-2xl bg-secondary/20" />
              <div className="h-40 animate-pulse rounded-2xl bg-secondary/20" />
            </div>
          </div>
        </div>
      </PublicLayout>
>>>>>>> origin/main
    );
  }

  if (isError || !winemaker) {
    return (
<<<<<<< HEAD
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  const wines = winesQuery.data || [];
  // GetEvents200 is `any` per OpenAPI; BE may return a raw array or a paginated
  // envelope. Normalise to an array here (track typed fix in WINE-XXX).
  const eventsRaw = eventsQuery.data as { data?: unknown[] } | unknown[] | undefined;
  const events = (Array.isArray(eventsRaw) ? eventsRaw : (eventsRaw?.data ?? [])) as Array<{
    id: string;
    startTime?: string;
    endTime?: string;
  }>;

  return (
    <div className="container mx-auto space-y-12 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        to="/winemakers"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to winemakers
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px]">
        <div className="space-y-12">
          <WinemakerDetailsCard winemaker={winemaker} />

          <Separator />

          <Section heading="Wines">
            <CatalogState
              emptyTitle="No wines listed yet"
              isEmpty={wines.length === 0}
              isLoading={winesQuery.isLoading}
            >
              <DataGrid variant="catalog">
                {wines.map((wine) => (
                  <WineCard key={wine.id} wine={wine} />
                ))}
              </DataGrid>
            </CatalogState>
          </Section>

          <Separator />

          <Section heading="Upcoming Events">
            <CatalogState
              emptyTitle="No upcoming events"
              isEmpty={events.length === 0}
              isLoading={eventsQuery.isLoading}
              loadingVariant="list"
            >
              <DataGrid variant="catalog">
                {events.map((event) => (
                  <EventCard
                    event={{
                      ...event,
                      winemaker: { id, name: winemaker.name },
                    }}
                    key={event.id}
                  />
                ))}
              </DataGrid>
            </CatalogState>
          </Section>
        </div>

        <aside className="space-y-12">
          <EntityReviewsSection entityId={id} entityType="winemaker" />
        </aside>
      </div>
    </div>
=======
      <PublicLayout>
        <div className="container mx-auto flex flex-col items-center py-24 text-center">
          <p className="font-bold text-destructive">Failed to load winemaker details.</p>
          <button
            className="text-primary hover:underline mt-2"
            onClick={() => refetch()}
            type="button"
          >
            Retry
          </button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-8 lg:px-12 space-y-12">
        <Link
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          search={{ page: 1, sort: "newest" }}
          to="/wines"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to catalog
        </Link>

        <WinemakerHero winemaker={winemaker} />

        <Separator />

        <WinemakerWinesList winemakerName={winemaker.name} wines={winemaker.wines} />
      </div>
    </PublicLayout>
>>>>>>> origin/main
  );
}
