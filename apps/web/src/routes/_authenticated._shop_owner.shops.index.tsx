import { createFileRoute, Link } from "@tanstack/react-router";
import { useGetShops } from "@/generated/shops/shops";

export const Route = createFileRoute("/_authenticated/_shop_owner/shops/")({
  component: MyShops,
});

function MyShops() {
  const { data: shops, isLoading } = useGetShops();

  if (isLoading) return <div>Loading shops...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">My Shops</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shops?.map((shop) => (
          <div key={shop.id} className="rounded-lg border p-4 shadow-sm">
            <h2 className="text-xl font-semibold">{shop.name}</h2>
            <p className="text-muted-foreground">{shop.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/shops/$id/inventory"
                params={{ id: shop.id }}
                className="rounded bg-primary px-3 py-1 text-white hover:bg-primary/90"
              >
                Inventory
              </Link>
              <Link
                to="/shops/$id/shop-orders"
                params={{ id: shop.id }}
                className="rounded bg-secondary px-3 py-1 hover:bg-secondary/80"
              >
                Orders
              </Link>
              <Link
                to="/shops/$id/bundles"
                params={{ id: shop.id }}
                className="rounded bg-accent px-3 py-1 hover:bg-accent/80"
              >
                Bundles
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Link
          to="/shops" // In a real app this might be /shops/new or similar
          className="rounded border border-primary px-4 py-2 text-primary hover:bg-primary/10"
        >
          Create New Shop
        </Link>
      </div>
    </div>
  );
}
