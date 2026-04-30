import { useQueryClient } from "@tanstack/react-query";
import {
  invalidateGetCarts,
  useDeleteCartsItemsByProductId,
  usePutCartsItemsByProductId,
} from "@/generated/carts/carts";
import type { GetCarts200 } from "@/generated/model/getCarts200";
import { CartEmpty } from "./CartEmpty";
import { CartItemRow } from "./CartItemRow";
import { CartSummary } from "./CartSummary";

type CartSectionProps = {
  cart: GetCarts200 | null;
  deliveryType?: "pickup" | "shipping";
};

export function CartSection({ cart, deliveryType }: CartSectionProps) {
  const queryClient = useQueryClient();

  const updateQuantity = usePutCartsItemsByProductId({
    mutation: { onSuccess: () => invalidateGetCarts(queryClient) },
  });

  const removeItem = useDeleteCartsItemsByProductId({
    mutation: { onSuccess: () => invalidateGetCarts(queryClient) },
  });

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity.mutate({ data: { quantity }, productId });
  };

  const handleRemove = (productId: string) => {
    removeItem.mutate({ productId });
  };

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-semibold">Your Cart</h3>
        {cart && cart.items.length > 0 && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-sm text-muted-foreground">
            {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>
      {isEmpty ? (
        <CartEmpty />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {cart.items.map((item) => (
              <CartItemRow
                item={item}
                key={item.id}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
          <CartSummary deliveryType={deliveryType} items={cart.items} />
        </>
      )}
    </div>
  );
}
