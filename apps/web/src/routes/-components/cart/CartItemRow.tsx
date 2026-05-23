import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ProductImage } from "@/components/catalog/ProductImage";
import { Button } from "@/components/ui/button";
import type { GetCarts200 } from "@/generated/types/GetCarts";
import { QuantityControl } from "./QuantityControl";

type CartItem = NonNullable<GetCarts200>["items"][number];

type CartItemRowProps = {
  item: CartItem;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

export function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps) {
  const quantity = Number(item.quantity);
  const price = Number.parseFloat(item.product.price);
  const lineTotal = price * quantity;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border p-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md">
        <ProductImage
          alt={item.product.name}
          className="h-full w-full object-cover"
          fallbackText={item.product.name}
          productId={item.product.id}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h4 className="truncate font-semibold text-foreground">{item.product.name}</h4>
        <p className="truncate text-sm text-muted-foreground">€{item.product.price}</p>
        <div className="mt-1">
          <QuantityControl
            onDecrement={() => onQuantityChange(item.product.id, quantity - 1)}
            onIncrement={() => onQuantityChange(item.product.id, quantity + 1)}
            value={quantity}
          />
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <span className="font-semibold text-foreground">€{lineTotal.toFixed(2)}</span>
        <Button
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(item.product.id)}
          size="icon"
          variant="ghost"
        >
          <HugeiconsIcon className="h-4 w-4" icon={Cancel01Icon} />
          <span className="sr-only">Remove item</span>
        </Button>
      </div>
    </div>
  );
}
