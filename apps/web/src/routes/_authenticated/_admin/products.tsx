import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
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
import { formatEur } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/_admin/products")({
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const { data, isLoading, error } = useGetProducts();
  const products = data?.data ?? [];

  if (error) {
    return (
      <main className="mx-auto max-w-6xl space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p>Failed to load products: {error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Products</h1>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton className="h-12 w-full" key={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={7}>
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {product.shop.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.isBundle ? "secondary" : "outline"}>
                        {product.isBundle ? "Bundle" : "Single"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatEur(product.price)}</TableCell>
                    <TableCell className="text-right text-sm">{product.quantity}</TableCell>
                    <TableCell className="text-right text-sm">
                      {product.rating === null
                        ? "—"
                        : `${product.rating.toFixed(1)} (${product.reviewCount})`}
                    </TableCell>
                    <TableCell>
                      <Link
                        className="text-sm text-primary hover:underline"
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
