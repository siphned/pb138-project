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
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";
import { formatDate } from "@/utils/date-formatter";

export const Route = createFileRoute("/_authenticated/_admin/winemakers")({
  component: AdminWinemakersPage,
});

function AdminWinemakersPage() {
  const { data, isLoading, error } = useGetWinemakers();
  const winemakers = data?.data ?? [];

  if (error) {
    return (
      <main className="mx-auto max-w-6xl space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Winemaker Moderation</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p>
            Failed to load winemakers: {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Winemaker Moderation</h1>

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
                <TableHead>Email</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winemakers.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={5}>
                    No winemakers found
                  </TableCell>
                </TableRow>
              ) : (
                winemakers.map((winemaker) => (
                  <TableRow key={winemaker.id}>
                    <TableCell className="font-medium">{winemaker.name}</TableCell>
                    <TableCell className="font-mono text-sm">{winemaker.email || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {winemaker.address.city}
                    </TableCell>
                    <TableCell className="text-sm">
                      {winemaker.createdAt ? formatDate(winemaker.createdAt) : "—"}
                    </TableCell>
                    <TableCell>
                      <Link
                        className="text-sm text-primary hover:underline"
                        params={{ id: winemaker.id }}
                        to="/winemakers/$id"
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
