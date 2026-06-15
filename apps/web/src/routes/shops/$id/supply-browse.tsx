import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { Section } from "@/components/primitives/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getSupplyAgreementsShopByShopIdQueryKey,
  useGetSupplyAgreementsShopByShopId,
} from "@/generated/hooks/useGetSupplyAgreementsShopByShopId";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";
import { usePostSupplyAgreements } from "@/generated/hooks/usePostSupplyAgreements";

export const Route = createFileRoute("/shops/$id/supply-browse")({
  component: ShopSupplyBrowsePage,
});

interface WinemakerRow {
  id: string;
  name: string;
  address?: { city?: string; country?: string };
}

interface AgreementRow {
  id: string;
  winemakerId: string;
  status?: string;
}

function statusBadgeVariant(status?: string): "secondary" | "outline" | "destructive" {
  if (status === "approved") return "secondary";
  if (status === "rejected") return "destructive";
  return "outline";
}

function ShopSupplyBrowsePage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const [winemakerSearch, setWinemakerSearch] = useState("");
  const winemakersQuery = useGetWinemakers();
  const agreementsQuery = useGetSupplyAgreementsShopByShopId(id);
  const propose = usePostSupplyAgreements();

  // GET /winemakers returns a paginated envelope ({ data, total, ... }), not a
  // bare array — unwrap .data so winemakers actually render.
  const winemakersRaw = winemakersQuery.data;
  const winemakers = (
    Array.isArray(winemakersRaw)
      ? winemakersRaw
      : ((winemakersRaw as { data?: WinemakerRow[] } | undefined)?.data ?? [])
  ) as WinemakerRow[];
  const agreementsRaw = agreementsQuery.data;
  const agreements = (
    Array.isArray(agreementsRaw)
      ? agreementsRaw
      : ((agreementsRaw as { data?: AgreementRow[] } | undefined)?.data ?? [])
  ) as AgreementRow[];

  // Quick lookup: winemakerId -> existing agreement
  const agreementByWinemaker = new Map<string, AgreementRow>();
  for (const a of agreements) {
    if (a.winemakerId) agreementByWinemaker.set(a.winemakerId, a);
  }

  const handlePropose = (winemakerId: string) => {
    propose.mutate(
      { data: { shopId: id, winemakerId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getSupplyAgreementsShopByShopIdQueryKey(id),
          });
        },
      }
    );
  };

  const renderAgreements = () => {
    if (agreementsQuery.isLoading) return <LoadingState variant="list" />;
    if (agreementsQuery.isError) {
      return (
        <ErrorState
          message="Could not load existing agreements."
          onRetry={() => agreementsQuery.refetch()}
          title="Failed to load"
        />
      );
    }
    if (agreements.length === 0) {
      return (
        <EmptyState
          description="Propose one below to get started."
          title="No supply agreements yet"
        />
      );
    }
    return (
      <ul className="divide-y divide-border rounded-md border border-border">
        {agreements.map((a) => {
          const wm = winemakers.find((w) => w.id === a.winemakerId);
          return (
            <li className="flex items-center justify-between gap-4 p-4" key={a.id}>
              <div className="min-w-0 flex-1">
                <Link
                  className="font-medium text-foreground hover:text-primary"
                  params={{ id: a.winemakerId }}
                  to="/winemakers/$id"
                >
                  {wm?.name ?? "Winemaker"}
                </Link>
              </div>
              <Badge variant={statusBadgeVariant(a.status)}>{a.status ?? "pending"}</Badge>
            </li>
          );
        })}
      </ul>
    );
  };

  const renderWinemakers = () => {
    if (winemakersQuery.isLoading) return <LoadingState variant="list" />;
    if (winemakersQuery.isError) {
      return (
        <ErrorState
          message="Could not load winemakers."
          onRetry={() => winemakersQuery.refetch()}
          title="Failed to load"
        />
      );
    }
    if (winemakers.length === 0) {
      return <EmptyState title="No winemakers on the platform yet" />;
    }
    const query = winemakerSearch.trim().toLowerCase();
    const filtered = query
      ? winemakers.filter((wm) => wm.name.toLowerCase().includes(query))
      : winemakers;
    if (filtered.length === 0) {
      return <EmptyState title={`No winemakers match "${winemakerSearch.trim()}"`} />;
    }
    return (
      <ul className="divide-y divide-border rounded-md border border-border">
        {filtered.map((wm) => {
          const existing = agreementByWinemaker.get(wm.id);
          const pending = propose.isPending && propose.variables?.data?.winemakerId === wm.id;
          return (
            <li className="flex items-center justify-between gap-4 p-4" key={wm.id}>
              <div className="min-w-0 flex-1">
                <Link
                  className="font-medium text-foreground hover:text-primary"
                  params={{ id: wm.id }}
                  to="/winemakers/$id"
                >
                  {wm.name}
                </Link>
                {wm.address && (
                  <p className="text-xs text-muted-foreground">
                    {[wm.address.city, wm.address.country].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
              {existing ? (
                <Badge variant={statusBadgeVariant(existing.status)}>
                  {existing.status ?? "pending"}
                </Badge>
              ) : (
                <Button disabled={pending} onClick={() => handlePropose(wm.id)} size="sm">
                  {pending ? "Sending…" : "Propose agreement"}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        params={{ id }}
        to="/shops/$id"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to shop
      </Link>

      <PageHeader
        description="Propose supply agreements with winemakers so you can stock their wines."
        title="Browse supply"
      />

      <Section heading={`Existing agreements (${agreements.length})`}>{renderAgreements()}</Section>

      <Section heading={`All winemakers (${winemakers.length})`}>
        <div className="space-y-4">
          <Input
            aria-label="Search winemakers by name"
            onChange={(e) => setWinemakerSearch(e.target.value)}
            placeholder="Search winemakers by name…"
            value={winemakerSearch}
          />
          {renderWinemakers()}
        </div>
      </Section>
    </div>
  );
}
