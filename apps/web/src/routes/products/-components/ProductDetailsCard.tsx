import { MinusSignIcon, PlusSignIcon, ShoppingCart02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShowOwner } from "@/components/primitives/show-owner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetShopsById } from "@/generated/hooks/useGetShopsById";
import type { GetProductsById200 } from "@/generated/types/GetProductsById";
import { formatEur } from "@/lib/utils";

interface ProductDetailsCardProps {
  product: GetProductsById200;
  onAddToCart: (quantity: number) => void;
  isAddingToCart: boolean;
}

function QuantityStepper({
  value,
  max,
  onChange,
  disabled,
}: {
  value: number;
  max: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        className="h-9 w-9 rounded-full"
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        size="icon"
        variant="outline"
      >
        <HugeiconsIcon className="h-4 w-4" icon={MinusSignIcon} />
        <span className="sr-only">Decrease quantity</span>
      </Button>
      <span className="min-w-10 text-center text-sm font-semibold tabular-nums">{value}</span>
      <Button
        className="h-9 w-9 rounded-full"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        size="icon"
        variant="outline"
      >
        <HugeiconsIcon className="h-4 w-4" icon={PlusSignIcon} />
        <span className="sr-only">Increase quantity</span>
      </Button>
    </div>
  );
}

function stockBadge(quantity: number) {
  if (quantity === 0) return { label: "Out of stock", variant: "destructive" as const };
  if (quantity <= 5) return { label: `Only ${quantity} left`, variant: "warning" as const };
  return { label: "In stock", variant: "success" as const };
}

export function ProductDetailsCard({
  product,
  onAddToCart,
  isAddingToCart,
}: ProductDetailsCardProps) {
  const [quantity, setQuantity] = useState(1);

  const shopId: string | undefined = product.shop?.id ?? product.shopId;
  const { data: fetchedShop } = useGetShopsById(shopId ?? "", {
    query: { enabled: !!shopId && !product.shop?.name },
  });
  const shopName: string | undefined = product.shop?.name ?? fetchedShop?.name;
  const shopOwnerUserId: string | undefined = product.shop?.ownerUserId ?? fetchedShop?.ownerUserId;

  // For a single-wine product (not a bundle), surface the winemaker behind it.
  const primaryWinemaker: { id?: string; name?: string } | undefined = product.isBundle
    ? undefined
    : product.productWines?.[0]?.wine?.winemaker;

  const price = formatEur(product.price);

  const outOfStock = product.quantity === 0;
  const stock = stockBadge(product.quantity);
  const clampedQuantity = Math.min(quantity, Math.max(1, product.quantity));

  return (
    <div className="space-y-8">
      <Card variant="default">
        <CardContent>
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              {product.isBundle && <Badge variant="secondary">Bundle</Badge>}
              <Badge variant={stock.variant}>{stock.label}</Badge>
            </div>

            <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              {product.name}
            </h1>

            <div className="space-y-1">
              <p className="font-heading text-3xl font-bold text-foreground">{price}</p>
              {shopId && shopName && (
                <p className="text-sm">
                  <Link
                    className="text-muted-foreground transition-colors hover:text-primary hover:underline"
                    params={{ id: shopId }}
                    to="/shops/$id"
                  >
                    Sold by {shopName}
                  </Link>
                </p>
              )}
              {primaryWinemaker?.id && primaryWinemaker.name && (
                <p className="text-sm">
                  <Link
                    className="text-muted-foreground transition-colors hover:text-primary hover:underline"
                    params={{ id: primaryWinemaker.id }}
                    to="/winemakers/$id"
                  >
                    By {primaryWinemaker.name}
                  </Link>
                </p>
              )}
            </div>

            {product.description && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Description
                  </p>
                  <p className="text-sm leading-relaxed text-foreground">{product.description}</p>
                </div>
              </>
            )}

            <Separator />

            <div className="flex flex-wrap items-center gap-4">
              <QuantityStepper
                disabled={outOfStock || isAddingToCart}
                max={product.quantity}
                onChange={setQuantity}
                value={clampedQuantity}
              />
              <Button
                className="flex-1 sm:flex-none"
                disabled={isAddingToCart || outOfStock}
                onClick={() => onAddToCart(clampedQuantity)}
              >
                <HugeiconsIcon className="mr-2 h-4 w-4" icon={ShoppingCart02Icon} />
                {isAddingToCart ? "Adding..." : "Add to cart"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {shopId && (
        <ShowOwner ownerUserId={shopOwnerUserId}>
          <div className="flex flex-wrap gap-4">
            <Button
              render={
                <Link
                  params={{ id: shopId, productId: product.id }}
                  search={{ isBundle: undefined }}
                  to="/shops/$id/inventory/$productId/edit"
                />
              }
              variant="outline"
            >
              Edit Product
            </Button>
          </div>
        </ShowOwner>
      )}
    </div>
  );
}
