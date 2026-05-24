import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetSupplyAgreementsShopByShopId } from "@/generated/hooks/useGetSupplyAgreementsShopByShopId";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";
import { usePostSupplyAgreements } from "@/generated/hooks/usePostSupplyAgreements";

export const Route = createFileRoute("/shops/$id/supply-browse")({
  component: SupplyBrowsePage,
});

function statusBadgeClass(status: string) {
  if (status === "approved") return "bg-green-100/30 text-green-700 dark:text-green-400";
  if (status === "rejected") return "bg-destructive/30 text-destructive";
  return "bg-yellow-100/30 text-yellow-700 dark:text-yellow-400";
}

// biome-ignore lint/suspicious/noExplicitAny: API response is untyped
type Agreement = Record<string, any>;
// biome-ignore lint/suspicious/noExplicitAny: API response is untyped
type Winemaker = Record<string, any>;

function SupplyBrowsePage() {
  const { id: shopId } = Route.useParams();
  const {
    data: agreementsData,
    isLoading: loadingAgreements,
    refetch,
  } = useGetSupplyAgreementsShopByShopId(shopId);
  const { data: winemakersData, isLoading: loadingWinemakers } = useGetWinemakers();
  const proposeMutation = usePostSupplyAgreements();
  const [proposingId, setProposingId] = useState<string | null>(null);

  const agreements = Array.isArray(agreementsData) ? (agreementsData as Agreement[]) : [];
  const winemakers = Array.isArray(winemakersData) ? (winemakersData as Winemaker[]) : [];
  const agreedWinemakerIds = new Set(agreements.map((a) => a.winemakerId));

  const handlePropose = (winemakerId: string) => {
    setProposingId(winemakerId);
    proposeMutation.mutate(
      { data: { shopId, winemakerId } },
      {
        onSettled: () => {
          setProposingId(null);
          refetch();
        },
      }
    );
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-10 px-6 py-8 lg:px-12">
      <h1 className="text-2xl font-bold">Supply Browse</h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Existing Agreements</h2>
        {loadingAgreements && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton className="h-12 w-full" key={i} />
            ))}
          </div>
        )}
        {!loadingAgreements && agreements.length === 0 && (
          <p className="text-sm text-muted-foreground">No supply agreements yet.</p>
        )}
        {!loadingAgreements && agreements.length > 0 && (
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Winemaker ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agreements.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-sm">{a.winemakerId}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(a.status)}`}
                      >
                        {a.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Browse Winemakers</h2>
        {loadingWinemakers && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton className="h-14 w-full" key={i} />
            ))}
          </div>
        )}
        {!loadingWinemakers && winemakers.length === 0 && (
          <p className="text-sm text-muted-foreground">No winemakers available.</p>
        )}
        {!loadingWinemakers && winemakers.length > 0 && (
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Agreement</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {winemakers.map((w) => {
                  const hasAgreement = agreedWinemakerIds.has(w.id);
                  const btnLabel =
                    proposeMutation.isPending && proposingId === w.id
                      ? "Requesting..."
                      : "Request Supply";
                  return (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium">{w.name ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {w.region ?? "—"}
                      </TableCell>
                      <TableCell>
                        {hasAgreement && (
                          <span className="text-xs text-muted-foreground">Already requested</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {!hasAgreement && (
                          <Button
                            disabled={proposeMutation.isPending && proposingId === w.id}
                            onClick={() => handlePropose(w.id)}
                            size="sm"
                            variant="outline"
                          >
                            {btnLabel}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
