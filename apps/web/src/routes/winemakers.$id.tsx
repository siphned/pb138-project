import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { StubGet } from "@/components/dev/StubGet";
import { StubMutation } from "@/components/dev/StubMutation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { useGetWinemakersById } from "@/generated/hooks/useGetWinemakersById";
import { useGetWinemakersByIdImages } from "@/generated/hooks/useGetWinemakersByIdImages";
import { useGetWinemakersByIdReviews } from "@/generated/hooks/useGetWinemakersByIdReviews";
import { useGetWines } from "@/generated/hooks/useGetWines";
import { usePostWinemakersByIdReviews } from "@/generated/hooks/usePostWinemakersByIdReviews";
import { WinemakerHero } from "./-components/WinemakerHero";
import { WinemakerTabs } from "./-components/WinemakerTabs";

export const Route = createFileRoute("/winemakers/$id")({
  component: WinemakerProfilePage,
});

function WinemakerProfilePage() {
  const { id } = Route.useParams();
  const { data: winemaker, isLoading, isError, refetch } = useGetWinemakersById(id);

  if (isLoading) {
    return (
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
    );
  }

  if (isError || !winemaker) {
    return (
      <div className="container mx-auto flex flex-col items-center py-24 text-center">
        <p className="font-bold text-destructive">Failed to load winemaker details.</p>
        <Button className="mt-2" onClick={() => refetch()} variant="link">
          Retry
        </Button>
      </div>
    );
  }

  return (
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

      <WinemakerTabs winemaker={winemaker} />

      {/* [STUB] hook audit */}
      <details className="container mx-auto p-6">
        <summary className="cursor-pointer font-mono text-sm">[STUB] hook audit</summary>
        <WinemakerDetailStubAudit id={id} />
      </details>
    </div>
  );
}

function WinemakerDetailStubAudit({ id }: { id: string }) {
  const imagesQuery = useGetWinemakersByIdImages({ id });
  const winesQuery = useGetWines({ winemakerId: id });
  const eventsQuery = useGetEvents({ winemakerId: id });
  const reviewsQuery = useGetWinemakersByIdReviews({ id });
  const reviewMutation = usePostWinemakersByIdReviews();
  return (
    <>
      <StubGet
        actorRole="guest+"
        hookName="useGetWinemakersByIdImages"
        query={imagesQuery}
        title="Winemaker images"
      />
      <StubGet
        actorRole="guest+"
        hookName="useGetWines?winemakerId="
        query={winesQuery}
        title="Their wines"
      />
      <StubGet
        actorRole="guest+"
        hookName="useGetEvents?winemakerId="
        query={eventsQuery}
        title="Their events"
      />
      <StubGet
        actorRole="guest+"
        hookName="useGetWinemakersByIdReviews"
        query={reviewsQuery}
        title="Reviews"
      />
      <StubMutation
        actorRole="customer+"
        hookName="usePostWinemakersByIdReviews"
        mutation={reviewMutation}
        payloadExample={{ data: { body: "Test review", rating: 5 }, id }}
        title="Write review"
      />
    </>
  );
}
