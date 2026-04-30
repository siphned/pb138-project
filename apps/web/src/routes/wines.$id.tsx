import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Droplets, Flame, Grape, Leaf } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGetWinesById } from "@/generated/hooks/useGetWinesById";
import type { GetWinesById200 } from "@/generated/types/GetWinesById";

export const Route = createFileRoute("/wines/$id")({
  component: WineDetailPage,
});

function WineDetailPage() {
  const { id } = Route.useParams();
  const { data: wine, isLoading, isError, refetch } = useGetWinesById(id);

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

  if (isError || !wine) {
    return (
      <PublicLayout>
        <div className="container mx-auto flex flex-col items-center py-24 text-center">
          <p className="font-bold text-destructive">Failed to load wine details.</p>
          <Button onClick={() => refetch()} variant="link">
            Retry
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-8 lg:px-12 space-y-8">
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

        {/* Winemaker Card */}
        <WinemakerCard wine={wine} />
      </div>
    </PublicLayout>
  );
}

function WineHeroVisual({ wine }: { wine: GetWinesById200 }) {
  return (
    <div className="flex h-80 items-center justify-center rounded-2xl bg-linear-to-b from-secondary/10 to-secondary/30">
      <div className="text-center">
        <Droplets className="mx-auto h-16 w-16 text-secondary-foreground/30 mb-4" />
        <div className="text-5xl font-bold uppercase tracking-widest text-secondary-foreground/20">
          {wine.color}
        </div>
        <p className="text-sm text-muted-foreground mt-4">{wine.type}</p>
      </div>
    </div>
  );
}

function WineHeader({ wine }: { wine: GetWinesById200 }) {
  return (
    <div className="space-y-3">
      <h1 className="font-heading text-4xl font-bold lg:text-5xl">{wine.name}</h1>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="inline-block rounded-md bg-secondary/20 px-3 py-1">
          {wine.vintageYear}
        </span>
        <span className="inline-block rounded-md bg-secondary/20 px-3 py-1">{wine.region}</span>
        <span className="inline-block rounded-md bg-secondary/20 px-3 py-1 capitalize">
          {wine.color}
        </span>
      </div>
    </div>
  );
}

function WineSpecsGrid({ wine }: { wine: GetWinesById200 }) {
  const specs = [
    {
      icon: Flame,
      label: "Alcohol Content",
      value: `${wine.alcoholContent}%`,
    },
    {
      icon: Droplets,
      label: "Volume",
      value: `${wine.volumeMl}ml`,
    },
    {
      icon: Leaf,
      label: "Type",
      value: wine.type,
    },
    {
      icon: Grape,
      label: "Quantity",
      value: `${wine.quantity} bottles`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {specs.map(({ icon: Icon, label, value }) => (
        <div className="rounded-lg border bg-card p-4" key={label}>
          <div className="flex items-center gap-3 mb-2">
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
          <p className="font-semibold text-sm">{value}</p>
        </div>
      ))}
    </div>
  );
}

function WinemakerCard({ wine }: { wine: GetWinesById200 }) {
  return (
    <div className="rounded-2xl border bg-card p-8">
      <h3 className="font-heading text-2xl font-bold mb-4">About the Winemaker</h3>
      <div className="flex items-center justify-between">
        <div>
          <Link
            className="text-xl font-bold text-primary hover:underline"
            params={{ id: wine.winemaker.id }}
            to="/winemakers/$id"
          >
            {wine.winemaker.name}
          </Link>
          <p className="text-sm text-muted-foreground mt-1">View full profile and other wines →</p>
        </div>
        <Link params={{ id: wine.winemaker.id }} to="/winemakers/$id">
          <Button>Visit Profile</Button>
        </Link>
      </div>
    </div>
  );
}
