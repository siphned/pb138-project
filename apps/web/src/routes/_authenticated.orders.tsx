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

export const Route = createFileRoute("/_authenticated/orders")({
  component: OrdersListPage,
});

const formatPrice = (price: string | number): string => {
  const num = typeof price === "string" ? Number.parseFloat(price) : price;
  return new Intl.NumberFormat("en-IE", {
    currency: "EUR",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(num);
};

const formatDate = (date: unknown): string => {
  if (typeof date === "string" || typeof date === "number") {
    return new Date(date).toLocaleDateString("en-IE");
  }
  return "—";
};

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case "pending":
      return "bg-yellow-100/30 text-yellow-700 dark:text-yellow-400";
    case "confirmed":
      return "bg-blue-100/30 text-blue-700 dark:text-blue-400";
    case "shipped":
      return "bg-purple-100/30 text-purple-700 dark:text-purple-400";
    case "delivered":
      return "bg-green-100/30 text-green-700 dark:text-green-400";
    case "cancelled":
      return "bg-red-100/30 text-red-700 dark:text-red-400";
    default:
      return "bg-gray-100/30 text-gray-700 dark:text-gray-400";
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
                    <TableCell className="font-medium">{formatPrice(order.totalPrice)}</TableCell>
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
