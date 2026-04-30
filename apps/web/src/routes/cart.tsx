import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useGetCarts } from "@/generated/carts/carts";
import { CartSection } from "./-components/cart/CartSection";
import { CheckoutSection } from "./-components/cart/CheckoutSection";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { data: cart } = useGetCarts();
  const cartData = cart ?? null;
  const [deliveryType, setDeliveryType] = useState<"pickup" | "shipping">("shipping");

  return (
    <PublicLayout>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h2 className="mb-8">Cart & Checkout</h2>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <CartSection cart={cartData} deliveryType={deliveryType} />
          <CheckoutSection cart={cartData} onDeliveryTypeChange={setDeliveryType} />
        </div>
      </div>
    </PublicLayout>
  );
}
