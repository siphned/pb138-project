import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetShops } from "@/generated/hooks/useGetShops";
import {
  getSupplyAgreementsWinemakerQueryKey,
  useGetSupplyAgreementsWinemaker,
} from "@/generated/hooks/useGetSupplyAgreementsWinemaker";
import { usePatchSupplyAgreementsById } from "@/generated/hooks/usePatchSupplyAgreementsById";

interface AgreementRow {
  id: string;
  shopId: string;
  status?: string;
}

interface ShopRow {
  id: string;
  name: string;
}

function statusBadgeVariant(status?: string): "secondary" | "outline" | "destructive" {
  if (status === "approved") return "secondary";
  if (status === "rejected") return "destructive";
  return "outline";
}

export function WinemakerSupplyTab() {
  const queryClient = useQueryClient();
  const query = useGetSupplyAgreementsWinemaker();
  const shopsQuery = useGetShops();
  const updateStatus = usePatchSupplyAgreementsById();

  const raw = query.data;
  const list = (
    Array.isArray(raw) ? raw : ((raw as { data?: AgreementRow[] } | undefined)?.data ?? [])
  ) as AgreementRow[];

  const shopsRaw = shopsQuery.data;
  const shops = (
    Array.isArray(shopsRaw)
      ? shopsRaw
      : ((shopsRaw as { data?: ShopRow[] } | undefined)?.data ?? [])
  ) as ShopRow[];
  const shopName = (id: string) => shops.find((s) => s.id === id)?.name ?? "Shop";

  const handleDecision = (agreementId: string, status: "approved" | "rejected") => {
    updateStatus.mutate(
      { data: { status }, id: agreementId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getSupplyAgreementsWinemakerQueryKey() });
        },
      }
    );
  };

  if (query.isLoading) return <LoadingState variant="list" />;
  if (query.isError) {
    return (
      <ErrorState
        message="Could not load incoming supply requests."
        onRetry={() => query.refetch()}
        title="Failed to load"
      />
    );
  }
  if (list.length === 0) {
    return (
      <EmptyState
        description="When a shop owner proposes an agreement to stock your wines, it'll appear here."
        title="No supply requests"
      />
    );
  }

  return (
    <ul className="divide-y divide-border rounded-md border border-border">
      {list.map((a) => {
        const pending = updateStatus.isPending && updateStatus.variables?.id === a.id;
        const isOpen = !a.status || a.status === "pending";
        return (
          <li className="flex items-center justify-between gap-4 p-4" key={a.id}>
            <div className="min-w-0 flex-1">
              <Link
                className="font-medium text-foreground hover:text-primary"
                params={{ id: a.shopId }}
                to="/shops/$id"
              >
                {shopName(a.shopId)}
              </Link>
              <p className="text-xs text-muted-foreground">Wants to stock your wines.</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusBadgeVariant(a.status)}>{a.status ?? "pending"}</Badge>
              {isOpen && (
                <>
                  <Button
                    disabled={pending}
                    onClick={() => handleDecision(a.id, "rejected")}
                    size="sm"
                    variant="outline"
                  >
                    Reject
                  </Button>
                  <Button disabled={pending} onClick={() => handleDecision(a.id, "approved")} size="sm">
                    Approve
                  </Button>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
