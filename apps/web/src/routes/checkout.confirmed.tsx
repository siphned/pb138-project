import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { Section } from "@/components/primitives/section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetOrdersById } from "@/generated/hooks/useGetOrdersById";
import type { GetOrdersById200 } from "@/generated/types/GetOrdersById";
import { cn } from "@/lib/utils";

type OrderItem = {
  id: string;
  quantity: number;
  unitPriceAtPurchase: string;
  product: { name: string };
};

type OrderAddress = {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
};

type OrderDetail = GetOrdersById200 & {
  items: OrderItem[];
  shippingAddress: OrderAddress;
};

export const Route = createFileRoute("/checkout/confirmed")({
  component: CheckoutConfirmedPage,
  validateSearch: (search) => ({
    orderId: typeof search.orderId === "string" ? search.orderId : "",
  }),
});

function CheckoutConfirmedPage() {
  const { orderId } = Route.useSearch();
  const { data, isLoading, isError, error, refetch } = useGetOrdersById(orderId || undefined);
  const order = data as OrderDetail | undefined;

  if (!orderId) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <ErrorState
          message="Missing order ID. Please check your order confirmation email."
          title="No order to show"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <LoadingState variant="detail" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="container mx-auto max-w-2xl space-y-4 px-4 py-8">
        <ErrorState
          message={typeof error === "string" ? error : "Could not load order details."}
          onRetry={() => refetch()}
          title="Order not found"
        />
        <Link className={cn(buttonVariants({ variant: "outline" }), "w-full")} to="/explore">
          Back to shopping
        </Link>
      </div>
    );
  }

  const subtotal = order.items.reduce(
    (acc, item) => acc + Number.parseFloat(item.unitPriceAtPurchase) * item.quantity,
    0
  );
  const deliveryFee = Number.parseFloat(order.shippingFee);
  const total = Number.parseFloat(order.totalPrice);

  const placedAt = new Date(order.createdAt);
  const formattedDate = placedAt.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = placedAt.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="container mx-auto max-w-2xl space-y-8 px-4 py-8">
      <Card className="space-y-2 p-6 text-center" variant="section">
        <div className="flex justify-center">
          <HugeiconsIcon
            aria-hidden
            className="h-12 w-12 text-primary"
            icon={CheckmarkCircle02Icon}
          />
        </div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Order placed!</h1>
        <p className="text-muted-foreground">Thank you for your order.</p>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-sm">
          <span className="text-muted-foreground">Order</span>
          <Badge className="font-mono" variant="secondary">
            {order.id}
          </Badge>
          <span className="text-muted-foreground">
            · {formattedDate} at {formattedTime}
          </span>
        </div>
      </Card>

      <Section heading="Items">
        <Card className="p-6" variant="section">
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li className="flex items-center justify-between gap-4" key={item.id}>
                <div>
                  <p className="font-medium text-foreground">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                </div>
                <p className="text-right font-semibold text-foreground">
                  €{(Number.parseFloat(item.unitPriceAtPurchase) * item.quantity).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="text-foreground">€{subtotal.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {order.deliveryType === "pickup" ? "Pickup" : "Shipping"}
              </dt>
              <dd className="text-foreground">€{deliveryFee.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <dt>Total</dt>
              <dd>€{total.toFixed(2)}</dd>
            </div>
          </dl>
        </Card>
      </Section>

      <Section heading="Delivery">
        <Card className="space-y-1 p-6 text-sm text-muted-foreground" variant="section">
          <p className="font-medium text-foreground">
            {order.deliveryType === "pickup" ? "Pickup location" : "Shipping address"}
          </p>
          <p>
            {order.shippingAddress.street} {order.shippingAddress.houseNumber}
          </p>
          <p>
            {order.shippingAddress.postalCode} {order.shippingAddress.city}
          </p>
          <p>{order.shippingAddress.country}</p>
        </Card>
      </Section>

      <Section heading="Payment & status">
        <Card className="space-y-3 p-6" variant="section">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Method</span>
            <span className="capitalize text-foreground">
              {order.paymentMethod.replace("_", " ")}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payment</span>
            <Badge variant="outline">{order.paymentStatus}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Order</span>
            <Badge>{order.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Your order is being processed. You'll receive an email update when it ships.
          </p>
        </Card>
      </Section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
          params={{ id: orderId }}
          to="/orders/$id"
        >
          View order
        </Link>
        <Link className={cn(buttonVariants(), "flex-1")} to="/explore">
          Back to shopping
        </Link>
      </div>
    </div>
  );
}
