import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ExploreSection } from "./-components/ExploreSection";

export const Route = createFileRoute("/explore")({
  component: ExplorePage,
});

function ExplorePage() {
  return (
    <PublicLayout>
      <div className="container mx-auto space-y-12 px-6 py-8 lg:px-12">
        <div className="space-y-2">
          <h1 className="font-heading text-4xl font-bold">Explore</h1>
          <p className="text-muted-foreground">
            Discover wines and curated bundles from our marketplace.
          </p>
        </div>
        <ExploreSection mode="wines" />
        <ExploreSection mode="bundles" />
      </div>
    </PublicLayout>
  );
}
