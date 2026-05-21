import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useGetCarts } from "@/generated/hooks/useGetCarts";
import { CartSection } from "./-components/cart/CartSection";
import { CheckoutSection } from "./-components/cart/CheckoutSection";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { data: cart, isLoading, isError, error } = useGetCarts();
  const cartData = cart ?? null;
  const [deliveryType, setDeliveryType] = useState<"pickup" | "shipping">(
    "shipping",
  );

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h2 className="mb-8">Cart &amp; Checkout</h2>
        <div className="flex items-center justify-center py-24 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Loading cart...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h2 className="mb-8">Cart &amp; Checkout</h2>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h3 className="text-xl font-semibold">Failed to load cart</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {typeof error === "string"
              ? error
              : "An unexpected error occurred while loading your cart. Please try again."}
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-8">Cart &amp; Checkout</h2>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <CartSection cart={cartData} deliveryType={deliveryType} />
        <CheckoutSection
          cart={cartData}
          deliveryType={deliveryType}
          onDeliveryTypeChange={setDeliveryType}
        />
      </div>
    </div>
  );
}
