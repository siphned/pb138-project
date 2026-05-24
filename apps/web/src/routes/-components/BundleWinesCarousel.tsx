<<<<<<< HEAD
import type { GetProducts200Item } from "@/components/catalog/ProductCard";
import { ProductCard } from "@/components/catalog/ProductCard";
import { useGetProducts } from "@/generated/hooks/useGetProducts";
=======
import { useGetShopsByIdProducts } from "@/generated/hooks/useGetShopsByIdProducts";
import { WineCard } from "./WineCard";
>>>>>>> origin/main

type ShopProductRaw = {
  id: string;
  name: string;
  price: string;
  shopId?: string;
  quantity?: number;
  isBundle?: boolean;
  createdAt?: string;
  updatedAt?: string | null;
  description?: string | null;
  rating?: number | string | null;
  reviewCount?: number | string | null;
  wines?: {
    id: string;
    name: string;
    type: string;
    color: string;
    vintageYear: number;
    region?: string;
    winemaker?: { id: string; name: string };
  }[];
  productWines?: {
    wine: {
      id: string;
      name: string;
      type: string;
      color: string;
      vintageYear: number;
      region?: string;
      winemaker?: { id: string; name: string };
    };
  }[];
};

interface BundleWinesCarouselProps {
  shopId: string;
  wineIds: string[];
}

export function BundleWinesCarousel({ shopId, wineIds }: BundleWinesCarouselProps) {
<<<<<<< HEAD
  const { data: rawData, isLoading } = useGetProducts({ isBundle: false, shopId });
  const allProducts = rawData?.data as ShopProductRaw[] | undefined;
=======
  const { data, isLoading } = useGetShopsByIdProducts(shopId, { isBundle: "false" });
  const allProducts = data as ShopProductRaw[] | undefined;
>>>>>>> origin/main

  const products =
    allProducts?.filter((p) => {
      const ids = Array.isArray(p.wines)
        ? p.wines.map((w) => w.id)
        : (p.productWines ?? []).map((pw) => pw.wine.id);
      return ids.some((id) => wineIds.includes(id));
    }) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="font-heading text-2xl font-bold">Wines in this Bundle</h2>
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div className="h-70 w-60 shrink-0 animate-pulse rounded-2xl bg-secondary/20" key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">Wines in this Bundle</h2>
      <div className="flex gap-4 overflow-x-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((p) => {
          const wine = Array.isArray(p.wines) ? p.wines[0] : p.productWines?.[0]?.wine;

<<<<<<< HEAD
          const productForCard = {
            createdAt: p.createdAt ?? "",
            description: p.description ?? null,
            id: p.id,
            isBundle: false,
            name: p.name,
            price: p.price,
            quantity: Number(p.quantity ?? 0),
            rating: Number(p.rating ?? 0),
            reviewCount: Number(p.reviewCount ?? 0),
            shop: { id: p.shopId ?? shopId, name: "" },
            updatedAt: p.updatedAt ?? null,
            wines: wine
              ? [
                  {
                    color: wine.color,
                    id: wine.id,
                    name: wine.name,
                    region: wine.region ?? "",
                    type: wine.type,
                    vintageYear: wine.vintageYear,
                    winemaker: wine.winemaker ?? { id: "", name: "" },
                  },
                ]
              : [],
            // shop-by-id product shape doesn't fully match GetProducts200Item; will narrow once BE unifies endpoints
          } as GetProducts200Item;

          return (
            <div className="w-60 shrink-0" key={p.id}>
              <ProductCard product={productForCard} />
=======
          return (
            <div className="w-60 shrink-0" key={p.id}>
              <WineCard
                product={{
                  createdAt: p.createdAt ?? "",
                  description: p.description ?? null,
                  id: p.id,
                  isBundle: false,
                  name: p.name,
                  price: p.price,
                  quantity: Number(p.quantity ?? 0),
                  rating: Number(p.rating ?? 0),
                  reviewCount: Number(p.reviewCount ?? 0),
                  shopId: p.shopId ?? shopId,
                  updatedAt: p.updatedAt ?? null,
                  wines: wine
                    ? [
                        {
                          color: wine.color,
                          id: wine.id,
                          name: wine.name,
                          region: wine.region ?? "",
                          type: wine.type,
                          vintageYear: wine.vintageYear,
                          winemaker: wine.winemaker ?? { id: "", name: "" },
                        },
                      ]
                    : [],
                }}
              />
>>>>>>> origin/main
            </div>
          );
        })}
      </div>
    </div>
  );
}
