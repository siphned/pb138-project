import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { RouteStub } from "./-components/RouteStub";

const searchSchema = z.object({
  orderId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/orders")({
  validateSearch: searchSchema,
  component: OrdersPage,
});

function OrdersPage() {
  return <RouteStub title="Order History" />;
}
