import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGetCarts } from "@/generated/hooks/useGetCarts";
import { CartSection } from "./-components/cart/CartSection";
import { CheckoutSection } from "./-components/cart/CheckoutSection";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { data: cart } = useGetCarts();
  const cartData = cart ?? null;
  const [deliveryType, setDeliveryType] = useState<"pickup" | "shipping">(
    "shipping",
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-8">Cart & Checkout</h2>
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
