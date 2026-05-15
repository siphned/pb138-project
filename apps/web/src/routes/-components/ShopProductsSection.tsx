import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import { WineCard } from "./WineCard";

type ShopProductRaw = {
  id: string;
  shopId?: string;
  name: string;
  description?: string | null;
  price: string;
  quantity?: number;
  isBundle?: boolean;
  createdAt?: string;
  updatedAt?: string | null;
  productWines?: {
    wine: {
      id: string;
      name: string;
      type: string;
      color: string;
      vintageYear: number;
    };
  }[];
  wines?: {
    id: string;
    name: string;
    type: string;
    color: string;
    vintageYear: number;
    region?: string;
    winemaker?: { id: string; name: string };
  }[];
};

interface ShopProductsSectionProps {
  shopId: string;
}

export function ShopProductsSection({ shopId }: ShopProductsSectionProps) {
  const { data: rawData, isLoading } = useGetProducts({ shopId, isBundle: false });
  const products = rawData?.data as ShopProductRaw[] | undefined;

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
                createdAt: product.createdAt ?? "",
                description: product.description ?? null,
                isBundle: !!product.isBundle,
                quantity: product.quantity ?? 0,
                rating: 0,
                reviewCount: 0,
                shopId: product.shopId ?? shopId,
                updatedAt: product.updatedAt ?? null,
                wines:
                  Array.isArray(product.wines) && product.wines.length > 0
                    ? product.wines.map((w) => ({
                        color: w.color,
                        id: w.id,
                        name: w.name,
                        region: w.region ?? "",
                        type: w.type,
                        vintageYear: w.vintageYear,
                        winemaker: w.winemaker ?? { id: "", name: "" },
                      }))
                    : (product.productWines ?? []).map((pw) => ({
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
          <Link
            className="flex items-center gap-2 text-sm "
            search={{ page: 1, shopId: shopId, sort: "newest" }}
            to="/products"
          >
            Show Inventory
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
