import { ShoppingCart01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { DataGrid } from "@/components/primitives/data-grid";
import { DescriptionList, PropertyRow } from "@/components/primitives/description-list";
import { PageHeader } from "@/components/primitives/page-header";
import { Section } from "@/components/primitives/section";
import { ShowOwner } from "@/components/primitives/show-owner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { GetProductsById200 } from "@/generated/types/GetProductsById";
import { WineCard } from "./WineCard";

interface ProductDetailsCardProps {
  product: GetProductsById200;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

export function ProductDetailsCard({
  product,
  onAddToCart,
  isAddingToCart,
}: ProductDetailsCardProps) {
  useEffect(() => {
    if (import.meta.env.DEV && product.shop && !product.shop.ownerUserId) {
      // biome-ignore lint/suspicious/noConsole: intentional warning for BE gap mentioned in plan §8
      console.warn("ProductDetailsCard: shop object missing ownerUserId. Owner gating may fail.");
    }
  }, [product.shop]);

  const price = Number(product.price).toLocaleString("en-IE", {
    currency: "EUR",
    style: "currency",
  });

  return (
    <div className="space-y-8">
      <PageHeader description={product.shop?.name} title={product.name} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_350px]">
        <div className="space-y-8">
          <Section heading="Details">
            <Card variant="default">
              <CardContent className="space-y-6 pt-6">
                <DescriptionList>
                  <PropertyRow label="Price" value={price} />
                  <PropertyRow
                    label="Availability"
                    value={product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
                  />
                  <PropertyRow
                    label="Type"
                    value={product.isBundle ? "Bundle" : "Single Product"}
                  />
                </DescriptionList>

                <Button
                  className="w-full sm:w-auto"
                  disabled={isAddingToCart || product.quantity === 0}
                  onClick={onAddToCart}
                >
                  <HugeiconsIcon className="mr-2 h-4 w-4" icon={ShoppingCart01Icon} />
                  {isAddingToCart ? "Adding..." : "Add to cart"}
                </Button>
              </CardContent>
            </Card>
          </Section>

          {product.productWines && product.productWines.length > 0 && (
            <Section heading="Wines in this product">
              <DataGrid variant="catalog">
                {product.productWines.map((pw) => {
                  const wineWithFallbacks = {
                    color: "unknown",
                    region: "",
                    vintageYear: "",
                    ...pw.wine,
                    // biome-ignore lint/suspicious/noExplicitAny: productWines.wine in OpenAPI is narrower than GetWines200Item (BE follow-up)
                  } as any;
                  return <WineCard key={pw.wine.id} wine={wineWithFallbacks} />;
                })}
              </DataGrid>
            </Section>
          )}
        </div>

        <div className="space-y-8">
          <ShowOwner ownerUserId={product.shop?.ownerUserId}>
            <Section heading="Owner Actions">
              <div className="flex flex-col gap-4">
                <Button
                  render={
                    <Link params={{ productId: product.id }} to="/products/$productId/edit" />
                  }
                  variant="outline"
                >
                  Edit Product
                </Button>
                <Button disabled variant="destructive">
                  Delete Product
                </Button>
              </div>
            </Section>
          </ShowOwner>
        </div>
      </div>
    </div>
  );
}
