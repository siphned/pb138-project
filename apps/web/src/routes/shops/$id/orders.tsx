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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOrdersQueryKey, useGetOrders } from "@/generated/hooks/useGetOrders";
import { usePatchOrdersByIdStatus } from "@/generated/hooks/usePatchOrdersByIdStatus";

export const Route = createFileRoute("/shops/$id/orders")({
  component: ShopOrdersPage,
});

interface OrderRow {
  id: string;
  status?: string;
  totalAmount?: string | number;
  createdAt?: string | number;
}

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type Status = (typeof STATUS_OPTIONS)[number];

function statusBadgeVariant(status?: string): "secondary" | "outline" | "destructive" {
  if (status === "cancelled") return "destructive";
  if (status === "delivered") return "secondary";
  return "outline";
}

function formatDate(value?: string | number) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ShopOrdersPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const query = useGetOrders({ shopId: id });
  const updateStatus = usePatchOrdersByIdStatus();

  const raw = query.data;
  const list = (
    Array.isArray(raw) ? raw : ((raw as { data?: OrderRow[] } | undefined)?.data ?? [])
  ) as OrderRow[];

  const handleStatusChange = (orderId: string, status: Status) => {
    updateStatus.mutate(
      { data: { status }, id: orderId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getOrdersQueryKey({ shopId: id }) });
        },
      }
    );
  };

  const renderOrders = () => {
    if (query.isLoading) return <LoadingState variant="list" />;
    if (query.isError) {
      return (
        <ErrorState
          message="Could not load orders for this shop."
          onRetry={() => query.refetch()}
          title="Failed to load"
        />
      );
    }
    if (list.length === 0) {
      return (
        <EmptyState
          description="Customer orders for this shop will appear here as they come in."
          title="No orders yet"
        />
      );
    }
    return (
      <ul className="divide-y divide-border rounded-md border border-border">
        {list.map((o) => {
          const pending = updateStatus.isPending && updateStatus.variables?.id === o.id;
          const date = formatDate(o.createdAt);
          return (
            <li className="flex items-center justify-between gap-4 p-4" key={o.id}>
              <div className="min-w-0 flex-1">
                <Link
                  className="font-medium text-foreground hover:text-primary"
                  params={{ id: o.id }}
                  to="/orders/$id"
                >
                  Order {o.id.slice(0, 8)}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {[date, o.totalAmount !== undefined ? `€${o.totalAmount}` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={statusBadgeVariant(o.status)}>{o.status ?? "pending"}</Badge>
                <Select
                  disabled={pending}
                  onValueChange={(v) => v && handleStatusChange(o.id, v as Status)}
                  value={(o.status as Status) ?? "pending"}
                >
                  <SelectTrigger className="w-[150px]" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  render={<Link params={{ id: o.id }} to="/orders/$id" />}
                  size="sm"
                  variant="outline"
                >
                  View
                </Button>
              </div>
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
        description="Customer orders placed at this shop. Advance the status as you fulfil each one."
        title="Orders"
      />

      <Section heading={`Orders (${list.length})`}>{renderOrders()}</Section>
    </div>
  );
}
