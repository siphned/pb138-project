import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import type { GetCarts200 } from "@/generated/types/GetCarts";
import { formatEur, lineTotalEur } from "@/lib/utils";
import { ProductImage } from "@/routes/-components/ProductImage";
import { QuantityControl } from "@/routes/-components/QuantityControl";

type CartItem = NonNullable<GetCarts200>["items"][number];

type CartItemRowProps = {
  item: CartItem;
  isUpdatingQuantity?: boolean;
  isRemoving?: boolean;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

export function CartItemRow({
  item,
  isUpdatingQuantity,
  isRemoving,
  onQuantityChange,
  onRemove,
}: CartItemRowProps) {
  const quantity = Number(item.quantity);
  const price = Number.parseFloat(item.product.price);
  const lineTotal = lineTotalEur(item.product.price, quantity);

  return (
    <div className="flex flex-wrap items-start gap-4 rounded-lg border border-border p-4 sm:flex-nowrap">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md">
        <ProductImage
          alt={item.product.name}
          className="h-full w-full object-cover"
          fallbackText={item.product.name}
          productId={item.product.id}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h4 className="break-words text-sm font-semibold leading-tight text-foreground sm:text-base">
          {item.product.name}
        </h4>
        {item.product.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{item.product.description}</p>
        )}
        <p className="text-sm text-muted-foreground">{formatEur(price)} each</p>
        <div className="mt-1">
          <QuantityControl
            disabled={isUpdatingQuantity}
            onDecrement={() => onQuantityChange(item.product.id, quantity - 1)}
            onIncrement={() => onQuantityChange(item.product.id, quantity + 1)}
            value={quantity}
          />
        </div>
      </div>

      <div className="ml-auto flex flex-col items-end gap-2 sm:ml-0">
        <span className="font-semibold text-foreground">{formatEur(lineTotal)}</span>
        <Button
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          disabled={isRemoving}
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
