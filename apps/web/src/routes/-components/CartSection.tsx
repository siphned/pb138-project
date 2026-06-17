import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { EmptyState } from "@/components/primitives/empty-state";
import { buttonVariants } from "@/components/ui/button";
import {
  getCartsQueryKey,
  useDeleteCartsItemsByProductId,
  usePutCartsItemsByProductId,
} from "@/generated/index";
import type { GetCarts200 } from "@/generated/types/GetCarts";
import { cn } from "@/lib/utils";
import { CartItemRow } from "@/routes/-components/CartItemRow";
import { CartSummary } from "@/routes/-components/CartSummary";

type CartSectionProps = {
  cart: GetCarts200 | null;
  deliveryType?: "pickup" | "shipping";
};

type CartUpdateContext = { previous: GetCarts200 | undefined };

export function CartSection({ cart, deliveryType }: CartSectionProps) {
  const queryClient = useQueryClient();

  const updateQuantity = usePutCartsItemsByProductId({
    mutation: {
      // context is cast explicitly because Biome sorts onError before onMutate,
      // which defeats TS's inference of the mutation context from onMutate's return.
      onError: (_err, _vars, context) => {
        const previous = (context as CartUpdateContext | undefined)?.previous;
        if (previous) {
          queryClient.setQueryData(getCartsQueryKey(), previous);
        }
        toast.error("Failed to update quantity. Please try again.");
      },
      // Optimistically patch the quantity in the cache so the number moves the
      // instant the user clicks, instead of waiting for the round-trip + refetch.
      // onError rolls back from the snapshot; onSettled reconciles with the server.
      onMutate: async ({ data, productId }): Promise<CartUpdateContext> => {
        await queryClient.cancelQueries({ queryKey: getCartsQueryKey() });
        const previous = queryClient.getQueryData<GetCarts200>(getCartsQueryKey());
        queryClient.setQueryData<GetCarts200>(getCartsQueryKey(), (old) =>
          old
            ? {
                ...old,
                items: old.items.map((item) =>
                  item.product.id === productId ? { ...item, quantity: data.quantity } : item
                ),
              }
            : old
        );
        return { previous };
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getCartsQueryKey() });
      },
    },
  });

  const removeItem = useDeleteCartsItemsByProductId({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getCartsQueryKey() });
        toast.success("Item removed from cart");
      },
      onError: () => {
        toast.error("Failed to remove item. Please try again.");
      },
    },
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
        <EmptyState
          action={
            <Link className={cn(buttonVariants({ variant: "outline" }))} to="/wines">
              Browse wines
            </Link>
          }
          description="Looks like you haven't added any wines to your cart yet."
          title="Your cart is empty"
        />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {cart.items.map((item) => (
              <CartItemRow
                item={item}
                isUpdatingQuantity={updateQuantity.isPending}
                isRemoving={removeItem.isPending}
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
