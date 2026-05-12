import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { WinemakerDetailsCard } from "@/components/catalog/WinemakerDetailsCard";
import { WineCard } from "@/components/catalog/WineCard";
import { LoadingState } from "@/components/primitives/loading-state";
import { ErrorState } from "@/components/primitives/error-state";
import { Section } from "@/components/primitives/section";
import { DataGrid } from "@/components/primitives/data-grid";
import { EmptyState } from "@/components/primitives/empty-state";
import { Separator } from "@/components/ui/separator";
import { useGetWinemakersById } from "@/generated/hooks/useGetWinemakersById";
import { useGetWines } from "@/generated/hooks/useGetWines";
import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { EntityReviewsSection } from "./-components/EntityReviewsSection";
import { EventCard } from "./-components/EventCard";

export const Route = createFileRoute("/winemakers/$id")({
  component: WinemakerProfilePage,
});

function WinemakerProfilePage() {
  const { id } = Route.useParams();
  const { data: winemaker, isLoading, isError, refetch } = useGetWinemakersById(id);
  const winesQuery = useGetWines({ winemakerId: id });
  const eventsQuery = useGetEvents({ winemakerName: winemaker?.name });

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <LoadingState variant="detail" />
      </div>
    );
  }

  if (isError || !winemaker) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  const wines = winesQuery.data || [];
  const events = eventsQuery.data || [];

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
            {winesQuery.isLoading ? (
              <LoadingState variant="catalog" />
            ) : wines.length === 0 ? (
              <EmptyState title="No wines listed yet" />
            ) : (
              <DataGrid variant="catalog">
                {wines.map((wine) => (
                  <WineCard key={wine.id} wine={wine} />
                ))}
              </DataGrid>
            )}
          </Section>

          <Separator />

          <Section heading="Upcoming Events">
            {eventsQuery.isLoading ? (
              <LoadingState variant="list" />
            ) : events.length === 0 ? (
              <EmptyState title="No upcoming events" />
            ) : (
              <DataGrid variant="catalog">
                {events.map((event: { id: string; startTime: any; endTime: any }) => (
                  <EventCard
                    event={{
                      ...event,
                      endDate: event.endTime,
                      startDate: event.startTime,
                      winemakerId: id,
                      winemakerName: winemaker.name,
                    }}
                    key={event.id}
                  />
                ))}
              </DataGrid>
            )}
          </Section>
        </div>

        <aside className="space-y-12">
          <EntityReviewsSection entityId={id} entityType="winemaker" />
        </aside>
      </div>
    </div>
  );
}
