import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGetWinemakersById } from "@/generated/hooks/useGetWinemakersById";
import { WinemakerHero } from "./-components/WinemakerHero";
import { WinemakerTabs } from "./-components/WinemakerTabs";
import { StubGet } from "@/components/dev/StubGet";
import { StubMutation } from "@/components/dev/StubMutation";
import { useGetWinemakersByIdImages } from "@/generated/hooks/useGetWinemakersByIdImages";
import { useGetWines } from "@/generated/hooks/useGetWines";
import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { useGetReviewsWinemakerById } from "@/generated/hooks/useGetReviewsWinemakerById";
import { usePostReviewsWinemakerById } from "@/generated/hooks/usePostReviewsWinemakerById";

export const Route = createFileRoute("/winemakers/$id")({
  component: WinemakerProfilePage,
});

function WinemakerProfilePage() {
  const { id } = Route.useParams();
  const { data: winemaker, isLoading, isError, refetch } = useGetWinemakersById(id);

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
    );
  }

  if (isError || !winemaker) {
    return (
      <PublicLayout>
        <div className="container mx-auto flex flex-col items-center py-24 text-center">
          <p className="font-bold text-destructive">Failed to load winemaker details.</p>
          <Button className="mt-2" onClick={() => refetch()} variant="link">
            Retry
          </Button>
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

        <WinemakerTabs winemaker={winemaker} />

        {/* [STUB] hook audit */}
        <details className="container mx-auto p-6">
          <summary className="cursor-pointer font-mono text-sm">[STUB] hook audit</summary>
          <WinemakerDetailStubAudit id={id} />
        </details>
      </div>
    </PublicLayout>
  );
}

function WinemakerDetailStubAudit({ id }: { id: string }) {
  const imagesQuery = useGetWinemakersByIdImages({ id });
  const winesQuery = useGetWines({ winemakerId: id });
  const eventsQuery = useGetEvents({ winemakerId: id });
  const reviewsQuery = useGetReviewsWinemakerById({ id });
  const reviewMutation = usePostReviewsWinemakerById();
  return (
    <>
      <StubGet title="Winemaker images" role="guest+" hookName="useGetWinemakersByIdImages" query={imagesQuery} />
      <StubGet title="Their wines" role="guest+" hookName="useGetWines?winemakerId=" query={winesQuery} />
      <StubGet title="Their events" role="guest+" hookName="useGetEvents?winemakerId=" query={eventsQuery} />
      <StubGet title="Reviews" role="guest+" hookName="useGetReviewsWinemakerById" query={reviewsQuery} />
      <StubMutation
        title="Write review"
        role="customer+"
        hookName="usePostReviewsWinemakerById"
        mutation={reviewMutation}
        payloadExample={{ id, data: { rating: 5, body: "Test review" } }}
      />
    </>
  );
}
