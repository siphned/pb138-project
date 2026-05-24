import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/primitives/page-header";
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
import { useGetOrders } from "@/generated/hooks/useGetOrders";
import type { GetOrders200 } from "@/generated/types/GetOrders";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shops/$id/orders")({
  component: ShopOrdersPage,
});

function formatPrice(value: string | number): string {
  return new Intl.NumberFormat("en-IE", { currency: "EUR", style: "currency" }).format(
    Number(value)
  );
}

function formatDate(value: string | number): string {
  return new Date(String(value)).toLocaleDateString("en-IE");
}

function getStatusBadgeClass(status: string): string {
  if (status === "completed" || status === "delivered") {
    return "bg-green-100/30 text-green-700 dark:text-green-400";
  }
  if (status === "pending" || status === "processing") {
    return "bg-yellow-100/30 text-yellow-700 dark:text-yellow-400";
  }
  if (status === "cancelled" || status === "refunded") {
    return "bg-destructive/30 text-destructive";
  }
  return "bg-muted text-muted-foreground";
}

type Order = GetOrders200[number];

function OrderRow({ order }: { order: Order }) {
  const shortId = order.id.slice(0, 8);

  return (
    <TableRow>
      <TableCell className="font-mono text-sm">{shortId}…</TableCell>
      <TableCell className="text-sm">{formatDate(order.createdAt)}</TableCell>
      <TableCell>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-semibold",
            getStatusBadgeClass(order.status)
          )}
        >
          {order.status}
        </span>
      </TableCell>
      <TableCell className="text-sm">{formatPrice(order.totalPrice)}</TableCell>
      <TableCell className="text-sm capitalize">{order.deliveryType}</TableCell>
      <TableCell>
        <Button
          render={<Link params={{ id: order.id }} to="/orders/$id" />}
          size="sm"
          variant="outline"
        >
          View
        </Button>
      </TableCell>
    </TableRow>
  );
}

function OrdersTableBody({ isLoading, orders }: { isLoading: boolean; orders: GetOrders200 }) {
  if (isLoading) {
    return Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 6 }).map((__, j) => (
          <TableCell key={j}>
            <Skeleton className="h-5 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ));
  }
  if (orders.length === 0) {
    return (
      <TableRow>
        <TableCell className="text-center text-muted-foreground" colSpan={6}>
          No orders found for this shop.
        </TableCell>
      </TableRow>
    );
  }
  return orders.map((order) => <OrderRow key={order.id} order={order} />);
}

function ShopOrdersPage() {
  const { id } = Route.useParams();
  const { data, isLoading, isError, refetch } = useGetOrders({ shopId: id });
  const orders = data || [];

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <PageHeader description="All orders placed through this shop." title="Shop Orders" />

      {isError && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p>Failed to load orders.</p>
          <Button className="mt-2" onClick={() => refetch()} size="sm" variant="outline">
            Retry
          </Button>
        </div>
      )}

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
            <OrdersTableBody isLoading={isLoading} orders={orders} />
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
