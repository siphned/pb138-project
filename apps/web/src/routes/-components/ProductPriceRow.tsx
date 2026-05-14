import {
  MinusSignIcon,
  PlusSignIcon,
  ShoppingCart01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCartsQueryKey } from "@/generated/hooks/useGetCarts";
import { usePostCartsItems } from "@/generated/hooks/usePostCartsItems";

interface ProductPriceRowProps {
  price: string;
  quantity: number;
  productId: string;
}

export function ProductPriceRow({ price, quantity, productId }: ProductPriceRowProps) {
  const queryClient = useQueryClient();
  const [qty, setQty] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutate: addToCart, isPending } = usePostCartsItems();

  const handleAddToCart = () => {
    addToCart(
      { data: { productId, quantity: qty } },
      {
        onSuccess: () => {
          setIsSuccess(true);
          queryClient.invalidateQueries({ queryKey: getCartsQueryKey() });
          setTimeout(() => setIsSuccess(false), 2000);
        },
      }
    );
  };

  const formattedPrice = new Intl.NumberFormat("en-IE", {
    currency: "EUR",
    style: "currency",
  }).format(Number.parseFloat(price));

  return (
    <div className="space-y-6 rounded-2xl bg-secondary/10 p-6 lg:sticky lg:top-8">
      <div className="flex items-center justify-between">
        <span className="font-heading text-3xl font-bold">{formattedPrice}</span>
        {quantity === 0 && <Badge variant="destructive">Out of stock</Badge>}
        {quantity > 0 && quantity <= 5 && (
          <Badge className="bg-warning-bg text-warning">Only {quantity} left</Badge>
        )}
        {quantity > 5 && <Badge className="bg-success-bg text-success">In stock</Badge>}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Quantity</span>
          <div className="flex items-center gap-3">
            <Button
              className="h-8 w-8 rounded-full"
              disabled={qty <= 1 || quantity === 0}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              size="icon"
              variant="outline"
            >
              <HugeiconsIcon className="h-4 w-4" icon={MinusSignIcon} />
            </Button>
            <span className="w-4 text-center font-medium">{qty}</span>
            <Button
              className="h-8 w-8 rounded-full"
              disabled={qty >= quantity || quantity === 0}
              onClick={() => setQty((q) => Math.min(quantity, q + 1))}
              size="icon"
              variant="outline"
            >
              <HugeiconsIcon className="h-4 w-4" icon={PlusSignIcon} />
            </Button>
          </div>
        </div>

        <Button
          className="w-full rounded-xl"
          disabled={quantity === 0 || isPending || isSuccess}
          onClick={handleAddToCart}
          size="lg"
        >
          {isSuccess && (
            <>
              <HugeiconsIcon className="mr-2 h-4 w-4" icon={Tick01Icon} />
              Added to cart!
            </>
          )}
          {!isSuccess && isPending && "Adding..."}
          {!isSuccess && !isPending && (
            <>
              <HugeiconsIcon className="mr-2 h-4 w-4" icon={ShoppingCart01Icon} />
              Add to cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
