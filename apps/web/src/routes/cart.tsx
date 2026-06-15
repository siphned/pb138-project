import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { useGetCarts } from "@/generated/hooks/useGetCarts";
import { CartSection } from "@/routes/-components/CartSection";
import { CheckoutSection } from "@/routes/-components/CheckoutSection";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { data: cart, isLoading, isError, error, refetch } = useGetCarts();
  const cartData = cart ?? null;
  const [deliveryType, setDeliveryType] = useState<"pickup" | "shipping">("shipping");

  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
      <PageHeader description="Review your cart and place your order." title="Cart & Checkout" />

      {isLoading && <LoadingState variant="detail" />}

      {isError && (
        <ErrorState
          message={
            typeof error === "string" ? error : "Could not load your cart. Please try again."
          }
          onRetry={() => refetch()}
          title="Failed to load cart"
        />
      )}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <CartSection cart={cartData} deliveryType={deliveryType} />
          <CheckoutSection
            cart={cartData}
            deliveryType={deliveryType}
            onDeliveryTypeChange={setDeliveryType}
          />
        </div>
      )}
    </div>
  );
}
