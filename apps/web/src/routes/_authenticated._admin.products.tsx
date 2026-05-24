import { createFileRoute, Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetProducts } from "@/generated/hooks/useGetProducts";

export const Route = createFileRoute("/_authenticated/_admin/products")({
  component: AdminProductsPage,
});

// biome-ignore lint/suspicious/noExplicitAny: API response is untyped
type Product = Record<string, any>;

function AdminProductsPage() {
  const { data, isLoading, error } = useGetProducts();
  const products = Array.isArray(data)
    ? (data as Product[])
    : ((data as { data?: Product[] })?.data ?? []);

  if (error) {
    return (
      <main className="mx-auto max-w-6xl space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          Failed to load products: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Products</h1>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton className="h-12 w-full" key={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={6}>
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name ?? "—"}</TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-muted text-muted-foreground">
                        {product.isBundle ? "Bundle" : "Standard"}
                      </span>
                    </TableCell>
                    <TableCell>{product.price ? `€${product.price}` : "—"}</TableCell>
                    <TableCell>{product.quantity ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {product.shopId ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Link
                        className="text-primary hover:underline text-sm"
                        params={{ productId: product.id }}
                        to="/products/$productId"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
