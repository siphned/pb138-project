import { createFileRoute, Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetOrders } from "@/generated/hooks/useGetOrders";
import type { GetOrders200 } from "@/generated/types/GetOrders";
import { formatEur } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/orders")({
  component: OrdersListPage,
});

const formatDate = (date: unknown): string => {
  if (typeof date === "string" || typeof date === "number") {
    return new Date(date).toLocaleDateString("en-IE");
  }
  return "—";
};

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case "pending":
      return "bg-warning-bg text-warning";
    case "confirmed":
      return "bg-secondary text-secondary-foreground";
    case "shipped":
      return "bg-secondary text-secondary-foreground";
    case "delivered":
      return "bg-success-bg text-success";
    case "cancelled":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-muted/30 text-muted-foreground";
  }
};

function OrdersListPage() {
  const { data, isLoading, error } = useGetOrders();
  const orders = (data as GetOrders200) || [];

  if (error) {
    return (
      <main className="mx-auto max-w-6xl space-y-4 p-6">
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p>Failed to load orders: {error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">My Orders</h1>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton className="h-12 w-full" key={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Delivery Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={6}>
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">{order.id}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{formatEur(order.totalPrice)}</TableCell>
                    <TableCell className="capitalize">{order.deliveryType}</TableCell>
                    <TableCell>
                      <Link
                        className="text-primary hover:underline text-sm"
                        params={{ id: order.id }}
                        to="/orders/$id"
                      >
                        View details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
