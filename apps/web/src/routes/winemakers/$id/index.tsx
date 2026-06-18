import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DataGrid } from "@/components/primitives/data-grid";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { Section } from "@/components/primitives/section";
import { Separator } from "@/components/ui/separator";
import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { useGetWinemakersById } from "@/generated/hooks/useGetWinemakersById";
import { useGetWinemakersByIdImages } from "@/generated/hooks/useGetWinemakersByIdImages";
import { useGetWinemakersMe } from "@/generated/hooks/useGetWinemakersMe";
import { useGetWines } from "@/generated/hooks/useGetWines";
import { useRoles } from "@/hooks/useRoles";
import { CatalogState } from "@/routes/-components/CatalogState";
import { EventCard } from "@/routes/-components/EventCard";
import { WineCard } from "@/routes/-components/WineCard";
import { WinemakerDetailsCard } from "@/routes/winemakers/$id/-components/WinemakerDetailsCard";
import { WinemakerGallery } from "@/routes/winemakers/$id/-components/WinemakerGallery";
import { EntityReviewsSection } from "../../-components/EntityReviewsSection";

export const Route = createFileRoute("/winemakers/$id/")({
  component: WinemakerProfilePage,
});

function WinemakerProfilePage() {
  const { id } = Route.useParams();
  const roles = useRoles();
  const { data: winemaker, isLoading, isError, refetch } = useGetWinemakersById(id);
  const { data: winemakerImages } = useGetWinemakersByIdImages(id);
  const { data: myWinemaker } = useGetWinemakersMe({
    query: { enabled: roles.includes("winemaker") },
  });
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
    );
  }

  if (isError || !winemaker) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  const canManage = !!myWinemaker?.id && myWinemaker.id === winemaker.id;
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

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <WinemakerGallery
            images={winemakerImages?.map((img) => img.url)}
            winemakerName={winemaker.name}
          />
        </div>

        <WinemakerDetailsCard canManage={canManage} winemaker={winemaker} />
      </div>

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
                  endDate: event.endTime,
                  startDate: event.startTime,
                  winemakerId: id,
                  winemakerName: winemaker.name,
                }}
                key={event.id}
              />
            ))}
          </DataGrid>
        </CatalogState>
      </Section>

      <Separator />

      <EntityReviewsSection entityId={id} entityType="winemaker" />
    </div>
  );
}
