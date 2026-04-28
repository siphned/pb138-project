import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetShopsByIdProducts } from "@/generated/hooks/productsController/useGetShopsByIdProducts";
import { WineCard } from "./WineCard";

// Shape returned by GET /shops/:id/products (no response schema in OpenAPI)
type ShopProductRaw = {
  id: string;
  shopId: string;
  name: string;
  description: string | null;
  price: string;
  quantity: number;
  isBundle: boolean;
  createdAt: string;
  updatedAt: string | null;
  productWines: {
    wine: {
      id: string;
      name: string;
      type: string;
      color: string;
      vintageYear: number;
    };
  }[];
};

interface ShopProductsSectionProps {
  shopId: string;
}

export function ShopProductsSection({ shopId }: ShopProductsSectionProps) {
  const { data, isLoading } = useGetShopsByIdProducts(shopId, { isBundle: "false" });
  const products = data as ShopProductRaw[] | undefined;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="font-heading text-2xl font-bold">Best Seller Wines</h2>
        <div className="flex gap-4 overflow-x-auto p-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[1, 2, 3].map((i) => (
            <div className="h-75 w-60 shrink-0 animate-pulse rounded-2xl bg-secondary/20" key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="font-heading text-2xl font-bold">Best Seller Wines</h2>
        <p className="text-sm text-muted-foreground">No wines listed yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">Best Seller Wines</h2>
      <div className="flex gap-4 overflow-x-auto p-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <div className="w-60 shrink-0" key={product.id}>
            <WineCard
              product={{
                ...product,
                rating: 0,
                reviewCount: 0,
                wines: product.productWines.map((pw) => ({
                  color: pw.wine.color,
                  id: pw.wine.id,
                  name: pw.wine.name,
                  region: "",
                  type: pw.wine.type,
                  vintageYear: pw.wine.vintageYear,
                  winemaker: { id: "", name: "" },
                })),
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <Button variant="outline">
          <Link className="flex items-center gap-2 text-sm " to="/wines">
            Show Inventory
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
