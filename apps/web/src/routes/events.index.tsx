import { FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { CatalogResults } from "@/components/catalog/CatalogResults";
import { CatalogState } from "@/components/catalog/CatalogState";
import type { EventSearch } from "@/components/catalog/types";
import { PageHeader } from "@/components/primitives/page-header";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { EventCard } from "@/components/events/EventCard";
import { useGetEvents } from "@/generated/hooks/useGetEvents";

const toNum = (v: unknown): number | undefined => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return undefined;
};

// GetEvents200 is typed as `any` in the OpenAPI spec; track BE fix in WINE-XXX.
type EventListItem = {
  id: string;
  title?: string;
  name?: string;
  description?: string | null;
  startDate?: string | Date;
  endDate?: string | Date;
  location?: string;
  winemakerName?: string;
  winemakerId?: string;
  attendees?: number;
};
type EventsResponse =
  | EventListItem[]
  | { data?: EventListItem[]; total?: number; page?: number; limit?: number }
  | undefined;

function normaliseEventsResponse(raw: EventsResponse, search: EventSearch) {
  const isArr = Array.isArray(raw);
  const list = isArr ? raw : (raw?.data ?? []);
  const total = isArr ? list.length : (raw?.total ?? list.length);
  const page = isArr ? (toNum(search.page) ?? 1) : (raw?.page ?? toNum(search.page) ?? 1);
  const limit = isArr ? (toNum(search.limit) ?? 10) : (raw?.limit ?? toNum(search.limit) ?? 10);
  return { limit, list, page, total };
}

export const Route = createFileRoute("/events/")({
  component: EventsPage,
  validateSearch: (raw): EventSearch => ({
    from: typeof raw.from === "string" ? raw.from : undefined,
    limit: toNum(raw.limit),
    page: toNum(raw.page),
    to: typeof raw.to === "string" ? raw.to : undefined,
    winemakerName: typeof raw.winemakerName === "string" ? raw.winemakerName : undefined,
  }),
});

function EventsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const query = useGetEvents(search);

  const handleSearchChange = (next: EventSearch) => {
    navigate({ replace: true, search: next });
  };

  const {
    list: eventsList,
    total,
    page,
    limit,
  } = normaliseEventsResponse(query.data as EventsResponse, search);

  const handlePageChange = (newPage: number) => {
    handleSearchChange({ ...search, page: newPage });
  };

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <PageHeader
        description="Discover wine tastings, festivals, and exclusive gatherings hosted by our winemakers."
        title="Upcoming Events"
      />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr]">
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger render={<Button className="w-full" size="sm" variant="outline" />}>
              <HugeiconsIcon className="mr-2 h-4 w-4" icon={FilterIcon} />
              Filters
            </SheetTrigger>
            <SheetContent className="w-[300px]" side="left">
              <div className="h-full overflow-y-auto px-4 py-8">
                <CatalogFilters
                  entity="events"
                  onSearchChange={handleSearchChange}
                  search={search}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <aside className="hidden lg:block">
          <CatalogFilters entity="events" onSearchChange={handleSearchChange} search={search} />
        </aside>

        <main className="space-y-8">
          <CatalogState
            emptyDescription="Check back soon for new events from your favorite winemakers."
            emptyTitle="No events found"
            isEmpty={eventsList.length === 0}
            isError={query.isError}
            isLoading={query.isLoading}
            onRetry={() => query.refetch()}
          >
            <CatalogResults count={total}>
              {eventsList.map((event) => (
                <EventCard event={event} key={event.id} />
              ))}
            </CatalogResults>
            <CatalogPagination
              limit={limit}
              onPageChange={handlePageChange}
              page={page}
              total={total}
            />
          </CatalogState>
        </main>
      </div>
    </div>
  );
}
