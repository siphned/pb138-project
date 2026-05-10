import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetWinemakersByIdReviews } from "@/generated/hooks/useGetWinemakersByIdReviews";
import type { GetWinemakersById200 } from "@/generated/types/GetWinemakersById";
import { EntityReviewsSection } from "./EntityReviewsSection";
import { EventCard } from "./EventCard";
import { WinemakerWinesList } from "./WinemakerWinesList";

interface WinemakerTabsProps {
  winemaker: GetWinemakersById200;
}

export function WinemakerTabs({ winemaker }: WinemakerTabsProps) {
  const { data: reviews, isLoading: isLoadingReviews } = useGetWinemakersByIdReviews(winemaker.id);

  return (
    <Tabs className="flex flex-col w-full" defaultValue="wines">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="wines">Wines</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>

      <TabsContent className="space-y-6" value="wines">
        <WinemakerWinesList winemakerName={winemaker.name} wines={winemaker.wines} />
      </TabsContent>

      <TabsContent className="space-y-6" value="events">
        <div className="space-y-4">
          <h2 className="font-heading text-2xl font-bold">Upcoming Events</h2>
          {winemaker.events.length === 0 ? (
            <p className="text-muted-foreground italic">No upcoming events for this winemaker.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {winemaker.events.map((event) => (
                <EventCard
                  event={{
                    ...event,
                    endDate: event.endTime,
                    startDate: event.startTime,
                    winemakerId: winemaker.id,
                    winemakerName: winemaker.name,
                  }}
                  key={event.id}
                />
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent className="space-y-6" value="reviews">
        <EntityReviewsSection
          emptyMessage="No reviews for this winemaker yet."
          isLoading={isLoadingReviews}
          reviewData={reviews}
          title="Winemaker Reviews"
        />
      </TabsContent>
    </Tabs>
  );
}
