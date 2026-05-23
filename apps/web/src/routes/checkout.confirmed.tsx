import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetOrdersById } from "@/generated/hooks/useGetOrdersById";

export const Route = createFileRoute("/checkout/confirmed")({
  component: CheckoutConfirmedPage,
  validateSearch: (search) => ({
    orderId: typeof search.orderId === "string" ? search.orderId : "",
  }),
});

function CheckoutConfirmedPage() {
  const { orderId } = Route.useSearch();
  const { data: order, isLoading, isError, error } = useGetOrdersById(orderId || undefined);

  if (!orderId) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Missing order ID. Please check your order confirmation email.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-center gap-2 py-24">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          <span className="text-muted-foreground">Loading order details...</span>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Order not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {typeof error === "string"
                ? error
                : "Could not load order details. Please try again."}
            </p>
          </CardContent>
          <CardFooter>
            <Link className="w-full" to="/explore">
              <Button className="w-full">Back to shopping</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const subtotal = order.items.reduce((acc, item) => {
    return acc + Number.parseFloat(item.unitPriceAtPurchase) * item.quantity;
  }, 0);

  const deliveryFee = Number.parseFloat(order.shippingFee);
  const total = Number.parseFloat(order.totalPrice);

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = new Date(order.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center text-green-600">✓</span>
                <CardTitle>Order Confirmed</CardTitle>
              </div>
              <CardDescription>Thank you for your order!</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-mono text-lg font-semibold">{order.id}</p>
            <p className="text-sm text-muted-foreground">
              Placed on {formattedDate} at {formattedTime}
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Order Items</p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  className="flex items-center justify-between rounded-md bg-muted p-3"
                  key={item.id}
                >
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-right font-semibold">
                    €{(Number.parseFloat(item.unitPriceAtPurchase) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {order.deliveryType === "pickup" ? "Pickup" : "Shipping"}
              </span>
              <span>€{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Delivery Details</p>
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium">
                {order.deliveryType === "pickup" ? "Pickup Location" : "Shipping Address"}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.street} {order.shippingAddress.houseNumber}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.postalCode} {order.shippingAddress.city}
              </p>
              <p className="text-sm text-muted-foreground">{order.shippingAddress.country}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Payment Method</p>
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm text-muted-foreground capitalize">
                {order.paymentMethod.replace("_", " ")}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Status:{" "}
                <span className="inline-block rounded bg-yellow-100 px-2 py-1 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Order Status</p>
            <div className="rounded-md bg-muted p-3">
              <p className="inline-block rounded bg-blue-100 px-2 py-1 text-sm capitalize text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                {order.status}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Your order is being processed. You'll receive an email update when it ships.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t">
          <Link className="w-full" to="/explore">
            <Button className="w-full">Continue Shopping</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
