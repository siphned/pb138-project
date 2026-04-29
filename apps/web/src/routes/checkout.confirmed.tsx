import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";
import { z } from "zod";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";

const searchSchema = z.object({ orderId: z.string().optional() });

export const Route = createFileRoute("/checkout/confirmed")({
  validateSearch: searchSchema,
  component: OrderConfirmedPage,
});

function OrderConfirmedPage() {
  const { orderId } = Route.useSearch();

  return (
    <PublicLayout>
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="rounded-full bg-success-bg p-4">
        <CheckCircle className="h-12 w-12 text-success" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Order Confirmed!</h2>
        <p className="max-w-sm text-muted-foreground">
          Thank you for your order. We&apos;ve sent a confirmation email with
          your order details and tracking information.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          to="/"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Continue Shopping
        </Link>
        {orderId && (
          <Link
            to="/orders"
            search={{ orderId }}
            className={cn(buttonVariants())}
          >
            View Order Details
          </Link>
        )}
      </div>
    </div>
  </PublicLayout>
  );
}
