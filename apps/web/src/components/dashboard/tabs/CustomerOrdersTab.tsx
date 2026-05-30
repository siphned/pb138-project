import { Link } from "@tanstack/react-router";
import { useGetOrders } from "@/generated/hooks/useGetOrders";
import { TabPreviewShell } from "./TabPreviewShell";

interface OrderRow {
  id: string;
  status?: string;
  totalAmount?: string | number;
  createdAt?: string | number;
}

function formatDate(value?: string | number) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CustomerOrdersTab() {
  const query = useGetOrders();
  const raw = query.data;
  const list = (Array.isArray(raw)
    ? raw
    : ((raw as { data?: OrderRow[] } | undefined)?.data ?? [])) as OrderRow[];
  const orders = list.slice(0, 10);
  const hasMore = list.length > 10;

  return (
    <TabPreviewShell
      emptyDescription="Orders you place will appear here."
      emptyTitle="No orders yet"
      hasMore={hasMore}
      isEmpty={!query.isLoading && orders.length === 0}
      isError={query.isError}
      isLoading={query.isLoading}
      onRetry={() => query.refetch()}
      viewAllTo="/orders"
    >
      <ul className="divide-y divide-border rounded-md border border-border">
        {orders.map((o) => {
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
                  {[o.status, date].filter(Boolean).join(" · ")}
                </p>
              </div>
              {o.totalAmount !== undefined && (
                <span className="font-medium text-foreground">€{o.totalAmount}</span>
              )}
            </li>
          );
        })}
      </ul>
    </TabPreviewShell>
  );
}
