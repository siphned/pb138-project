import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetOrdersById } from "@/generated/hooks/useGetOrdersById";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  component: OrderDetailPage,
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
    return new Date(date).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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

function OrderDetailPage() {
  const { id } = Route.useParams();
  const { data: order, isLoading, error } = useGetOrdersById(id);

  if (error) {
    return (
      <main className="mx-auto max-w-4xl space-y-4 p-6">
        <Link className="text-primary hover:underline text-sm" to="/orders">
          ← Back to orders
        </Link>
        <h1 className="text-2xl font-semibold">Order {id}</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p>Failed to load order: {error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </main>
    );
  }

  if (isLoading || !order) {
    return (
      <main className="mx-auto max-w-4xl space-y-4 p-6">
        <Link className="text-primary hover:underline text-sm" to="/orders">
          ← Back to orders
        </Link>
        <h1 className="text-2xl font-semibold">Order {id}</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton className="h-32 w-full" key={i} />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <Link className="text-primary hover:underline text-sm" to="/orders">
        ← Back to orders
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Order {order.id}</h1>
          <p className="text-muted-foreground mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-sm font-semibold",
              getStatusBadgeClass(order.status)
            )}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Billing Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Street</p>
              <p className="font-medium">
                {order.billingAddress.street} {order.billingAddress.houseNumber}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">City</p>
              <p className="font-medium">{order.billingAddress.city}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Postal Code</p>
              <p className="font-medium">{order.billingAddress.postalCode}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Country</p>
              <p className="font-medium">{order.billingAddress.country}</p>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Street</p>
              <p className="font-medium">
                {order.shippingAddress.street} {order.shippingAddress.houseNumber}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">City</p>
              <p className="font-medium">{order.shippingAddress.city}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Postal Code</p>
              <p className="font-medium">{order.shippingAddress.postalCode}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Country</p>
              <p className="font-medium">{order.shippingAddress.country}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product.name}</TableCell>
                    <TableCell className="text-right">
                      {formatPrice(item.unitPriceAtPurchase)}
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(Number.parseFloat(item.unitPriceAtPurchase) * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>
              {formatPrice(
                order.items.reduce(
                  (sum, item) => sum + Number.parseFloat(item.unitPriceAtPurchase) * item.quantity,
                  0
                )
              )}
            </span>
          </div>
          {Number.parseFloat(order.shippingFee) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatPrice(order.shippingFee)}</span>
            </div>
          )}
          {Number.parseFloat(order.discount) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-green-600 dark:text-green-400">
                -{formatPrice(order.discount)}
              </span>
            </div>
          )}
          <div className="border-t border-border pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-lg">{formatPrice(order.totalPrice)}</span>
          </div>
          <div className="pt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Status</span>
              <span className="capitalize">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Type</span>
              <span className="capitalize">{order.deliveryType}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
