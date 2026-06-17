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
import { useGetShops } from "@/generated/hooks/useGetShops";
import { formatDate } from "@/utils/date-formatter";

export const Route = createFileRoute("/_authenticated/_admin/shops")({
  component: AdminShopsPage,
});

function AdminShopsPage() {
  const { data, isLoading, error } = useGetShops();
  const shops = data?.data ?? [];

  if (error) {
    return (
      <main className="mx-auto max-w-6xl space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Shop Moderation</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p>Failed to load shops: {error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Shop Moderation</h1>

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
                <TableHead>Shop Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={4}>
                    No shops found
                  </TableCell>
                </TableRow>
              ) : (
                shops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell className="font-medium">{shop.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {shop.address.city}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(shop.createdAt)}</TableCell>
                    <TableCell>
                      <Link
                        className="text-sm text-primary hover:underline"
                        params={{ id: shop.id }}
                        to="/shops/$id"
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
