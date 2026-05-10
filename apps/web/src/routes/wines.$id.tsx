import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Droplets, Flame, Grape, Leaf } from "lucide-react";
import { StubGet } from "@/components/dev/StubGet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import { useGetWinesById } from "@/generated/hooks/useGetWinesById";
import { useGetWinesByIdImages } from "@/generated/hooks/useGetWinesByIdImages";
import type { GetWinesById200 } from "@/generated/types/GetWinesById";
import { WinesAvailableInShops } from "./-components/WinesAvailableInShops";

export const Route = createFileRoute("/wines/$id")({
  component: WineDetailPage,
});

function WineDetailPage() {
  const { id } = Route.useParams();
  const { data: wine, isLoading, isError, refetch } = useGetWinesById(id);

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

  if (isError || !wine) {
    return (
        <div className="container mx-auto flex flex-col items-center py-24 text-center">
          <p className="font-bold text-destructive">Failed to load wine details.</p>
          <Button onClick={() => refetch()} variant="link">
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Wine Visual & Specs */}
          <div className="space-y-8">
            <WineHeroVisual wine={wine} />
            <WineSpecsGrid wine={wine} />
          </div>

          {/* Wine Info */}
          <div className="space-y-6">
            <WineHeader wine={wine} />

            {wine.description && (
              <div className="space-y-3">
                <h3 className="font-heading text-lg font-semibold">Tasting Notes</h3>
                <p className="text-muted-foreground leading-relaxed">{wine.description}</p>
              </div>
            )}

            {wine.composition && (
              <div className="space-y-3">
                <h3 className="font-heading text-lg font-semibold">Composition</h3>
                <p className="text-muted-foreground leading-relaxed">{wine.composition}</p>
              </div>
            )}

            {wine.attribution && (
              <div className="space-y-3">
                <h3 className="font-heading text-lg font-semibold">Notes</h3>
                <p className="text-muted-foreground leading-relaxed">{wine.attribution}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <WinesAvailableInShops wineId={wine.id} />

        <Separator />

        {/* Winemaker Card */}
        <WinemakerCard wine={wine} />

        {/* [STUB] hook audit — remove when real UI ships */}
        <details className="container mx-auto p-6">
          <summary className="cursor-pointer font-mono text-sm">[STUB] hook audit</summary>
          <WineDetailStubAudit id={id} />
        </details>
      </div>
  );
}

function WineDetailStubAudit({ id }: { id: string }) {
  const imagesQuery = useGetWinesByIdImages({ id });
  const productsQuery = useGetProducts({ wineId: id });
  return (
    <>
      <StubGet
        actorRole="guest+"
        hookName="useGetWinesByIdImages"
        query={imagesQuery}
        title="Wine images"
      />
      <StubGet
        actorRole="guest+"
        hookName="useGetProducts?wineId="
        query={productsQuery}
        title="Products selling this wine"
      />
    </>
  );
}

function WineHeroVisual({ wine }: { wine: GetWinesById200 }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-3xl bg-secondary/10">
      <div className="absolute inset-0 flex items-center justify-center p-12">
        {/* Placeholder for wine bottle visual */}
        <div className="relative h-full w-32 rounded-t-full rounded-b-lg border-4 border-primary/20 bg-primary/5 shadow-2xl">
          <div className="absolute inset-x-0 top-1/4 h-32 bg-primary/10 flex items-center justify-center overflow-hidden">
            <span className="text-[10px] font-bold text-primary/40 rotate-90 uppercase tracking-widest">
              {wine.name}
            </span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 right-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-sm">
          <Grape className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}

function WineHeader({ wine }: { wine: GetWinesById200 }) {
  let colorClass = "bg-pink-400";
  if (wine.color === "red") {
    colorClass = "bg-red-600";
  } else if (wine.color === "white") {
    colorClass = "bg-yellow-200";
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl font-bold tracking-tight lg:text-5xl">{wine.name}</h1>
        <p className="text-xl text-muted-foreground">
          {wine.winemaker.name} â€¢ {wine.vintageYear}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 rounded-full border bg-secondary/5 px-3 py-1 text-sm font-medium">
          <div className={`h-2 w-2 rounded-full ${colorClass}`} />
          {wine.color.charAt(0).toUpperCase() + wine.color.slice(1)}
        </div>
        <div className="rounded-full border bg-secondary/5 px-3 py-1 text-sm font-medium">
          {wine.type.charAt(0).toUpperCase() + wine.type.slice(1)}
        </div>
      </div>
    </div>
  );
}

function WineSpecsGrid({ wine }: { wine: GetWinesById200 }) {
  const specs = [
    { icon: Leaf, label: "Region", value: wine.region },
    { icon: Flame, label: "Alcohol", value: `${wine.alcoholContent}%` },
    { icon: Droplets, label: "Volume", value: `${wine.volumeMl}ml` },
    { icon: Grape, label: "Vintage", value: wine.vintageYear },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
      {specs.map((spec) => (
        <div className="rounded-2xl border bg-card p-4 shadow-xs" key={spec.label}>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <spec.icon className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">{spec.label}</span>
          </div>
          <p className="font-heading text-lg font-bold">{spec.value}</p>
        </div>
      ))}
    </div>
  );
}

function WinemakerCard({ wine }: { wine: GetWinesById200 }) {
  return (
    <div className="rounded-3xl border bg-secondary/5 p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h3 className="font-heading text-2xl font-bold">About the Winemaker</h3>
          <p className="text-lg font-medium text-primary">{wine.winemaker.name}</p>
          <p className="text-muted-foreground mt-1">View full profile and other wines â†’</p>
        </div>
        <Link params={{ id: wine.winemaker.id }} to="/winemakers/$id">
          <Button size="lg">Visit Profile</Button>
        </Link>
      </div>
    </div>
  );
}
