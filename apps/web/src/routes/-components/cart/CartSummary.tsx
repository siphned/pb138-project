import { Separator } from "@/components/ui/separator";
import type { GetCarts200 } from "@/generated/types/GetCarts";

type CartItem = NonNullable<GetCarts200>["items"][number];

type CartSummaryProps = {
  items: CartItem[];
  deliveryType?: "pickup" | "shipping";
};

export function CartSummary({ items, deliveryType = "shipping" }: CartSummaryProps) {
  const deliveryCost = deliveryType === "pickup" ? 0.0 : 15.0; // Changed from hardcoded 42.0
  const subtotal = items.reduce((acc, item) => {
    const price = Number.parseFloat(item.product.price);
    const quantity = Number(item.quantity);
    return acc + price * quantity;
  }, 0);

  const formatPrice = (n: number) => n.toFixed(2);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{formatPrice(subtotal)}€</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Shipping</span>
        <span className="text-muted-foreground">{formatPrice(deliveryCost)}€</span>
      </div>
      <Separator />
      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>{formatPrice(subtotal + deliveryCost)}€</span>
      </div>
    </div>
  );
}
