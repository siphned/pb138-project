import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { RouteStub } from "./-components/RouteStub";

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
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Order Details</h1>
        <div className="bg-muted p-6 rounded-lg">
          <p className="font-medium">Order ID: {orderId}</p>
          <p className="text-muted-foreground mt-2">
            Your order has been placed successfully. This page is under construction.
          </p>
        </div>
      </div>
    );
  }

  return <RouteStub title="Order History" />;
}
