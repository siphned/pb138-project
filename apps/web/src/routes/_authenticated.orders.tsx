import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Package, ArrowRight, Calendar } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetOrdersById } from "@/generated/hooks/useGetOrdersById";

const searchSchema = z.object({
  orderId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/orders")({
  component: OrdersPage,
  validateSearch: searchSchema,
});

function OrdersPage() {
  const { orderId } = Route.useSearch();

  if (orderId) {
    return <OrderDetailView orderId={orderId} />;
  }

  return <OrderHistoryView />;
}

function OrderDetailView({ orderId }: { orderId: string }) {
  const { data: order, isLoading, error, refetch } = useGetOrdersById(orderId);

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="container mx-auto max-w-2xl p-8">
          <div className="h-8 w-32 animate-pulse rounded-md bg-secondary/20 mb-4" />
          <div className="h-40 animate-pulse rounded-lg bg-secondary/20" />
        </div>
      </AuthLayout>
    );
  }

  if (error || !order) {
    return (
      <AuthLayout>
        <div className="container mx-auto max-w-2xl p-8">
          <p className="text-destructive font-bold">Failed to load order.</p>
          <Button onClick={() => refetch()} variant="link">
            Retry
          </Button>
        </div>
      </AuthLayout>
    );
  }

  const orderData = order as any;

  return (
    <AuthLayout>
      <div className="container mx-auto max-w-2xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Order Details</h1>
            <p className="text-muted-foreground mt-1">Order ID: {orderId}</p>
          </div>
          <Link to="/orders">
            <Button variant="outline">Back to Orders</Button>
          </Link>
        </div>

        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-900 capitalize">
                {orderData.status || "Pending"}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment Status</span>
              <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-900 capitalize">
                {orderData.paymentStatus || "Pending"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {orderData.items && Array.isArray(orderData.items) && (
              <div className="space-y-2">
                {orderData.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>
                      {item.product?.name || "Product"} x {item.quantity}
                    </span>
                    <span className="font-medium">
                      €{(Number(item.unitPriceAtPurchase) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>€{Number(orderData.totalPrice || 0).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        {orderData.shippingAddress && (
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>{orderData.shippingAddress.street}</p>
              <p>{orderData.shippingAddress.houseNumber}</p>
              <p>
                {orderData.shippingAddress.city}, {orderData.shippingAddress.postalCode}
              </p>
              <p>{orderData.shippingAddress.country}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthLayout>
  );
}

function OrderHistoryView() {
  return (
    <AuthLayout>
      <div className="container mx-auto max-w-4xl p-8 space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Order History</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your orders and shipments
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Your Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold mb-2">No orders yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Start shopping to see your orders appear here. Once you place an order, you'll be
                able to track it from this page.
              </p>
              <Link className="mt-6" to="/wines">
                <Button>
                  Browse Wines
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Example (would be replaced with real data) */}
        <Card className="border-dashed opacity-50">
          <CardHeader>
            <CardTitle className="text-sm">Sample Order (placeholder)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Order #ORD-2024-001</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>March 15, 2024</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">€125.00</p>
                <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-900 mt-1">
                  Delivered
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
