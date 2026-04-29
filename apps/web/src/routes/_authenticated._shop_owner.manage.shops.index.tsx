import { createFileRoute, Link } from "@tanstack/react-router";
import { useGetShopsMe } from "@/generated/hooks/shopsController/useGetShopsMe";

export const Route = createFileRoute("/_authenticated/_shop_owner/manage/shops/")({
  component: MyShops,
});

function MyShops() {
  const { data: shops, isLoading } = useGetShopsMe();

  if (isLoading) return <div>Loading shops...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">My Shops</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shops?.map((shop) => (
          <div className="rounded-lg border p-4 shadow-sm" key={shop.id}>
            <h2 className="text-xl font-semibold">{shop.name}</h2>
            <p className="text-muted-foreground">{shop.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                className="rounded bg-primary px-3 py-1 text-white hover:bg-primary/90"
                params={{ id: shop.id }}
                to="/manage/shops/$id/inventory"
              >
                Inventory
              </Link>
              <Link
                className="rounded bg-secondary px-3 py-1 hover:bg-secondary/80"
                params={{ id: shop.id }}
                to="/manage/shops/$id/shop-orders"
              >
                Orders
              </Link>
              <Link
                className="rounded bg-accent px-3 py-1 hover:bg-accent/80"
                params={{ id: shop.id }}
                to="/manage/shops/$id/bundles"
              >
                Bundles
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Link
          className="rounded border border-primary px-4 py-2 text-primary hover:bg-primary/10" // In a real app this might be /shops/new or similar
          to="/shops"
        >
          Create New Shop
        </Link>
      </div>
    </div>
  );
}
