import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { Section } from "@/components/primitives/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePatchSupplyAgreementsById } from "@/generated/hooks/usePatchSupplyAgreementsById";
import {
  getSupplyAgreementsWinemakerQueryKey,
  useGetSupplyAgreementsWinemaker,
} from "@/generated/hooks/useGetSupplyAgreementsWinemaker";

export const Route = createFileRoute("/shops/$id/supply-incoming")({
  component: ShopSupplyIncomingPage,
});

interface AgreementRow {
  id: string;
  shopId: string;
  winemakerId?: string;
  status?: string;
  shop?: { id?: string; name?: string };
}

function statusBadgeVariant(status?: string): "secondary" | "outline" | "destructive" {
  if (status === "approved") return "secondary";
  if (status === "rejected") return "destructive";
  return "outline";
}

function ShopSupplyIncomingPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const query = useGetSupplyAgreementsWinemaker();
  const updateStatus = usePatchSupplyAgreementsById();

  const raw = query.data;
  const list = (Array.isArray(raw)
    ? raw
    : ((raw as { data?: AgreementRow[] } | undefined)?.data ?? [])) as AgreementRow[];

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
        description="Supply agreement proposals from shops that want to stock your wines."
        title="Incoming supply requests"
      />

      <Section heading={`Requests (${list.length})`}>
        {query.isLoading ? (
          <LoadingState variant="list" />
        ) : query.isError ? (
          <ErrorState
            message="Could not load incoming supply requests."
            onRetry={() => query.refetch()}
            title="Failed to load"
          />
        ) : list.length === 0 ? (
          <EmptyState
            description="When a shop owner proposes an agreement to stock your wines, it'll appear here."
            title="No incoming requests"
          />
        ) : (
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
                      {a.shop?.name ?? "Shop"}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Wants to stock your wines.
                    </p>
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
                        <Button
                          disabled={pending}
                          onClick={() => handleDecision(a.id, "approved")}
                          size="sm"
                        >
                          Approve
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}
