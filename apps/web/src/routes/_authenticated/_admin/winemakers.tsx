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

export const Route = createFileRoute("/_authenticated/_admin/winemakers")({
  component: AdminWinemakersPage,
});

function getStatusBadgeClass(status: string): string {
  if (status === "active") {
    return "bg-green-100/30 text-green-700 dark:text-green-400";
  }
  if (status === "suspended") {
    return "bg-yellow-100/30 text-yellow-700 dark:text-yellow-400";
  }
  return "bg-destructive/30 text-destructive dark:text-red-400";
}

function AdminWinemakersPage() {
  const { data, isLoading, error } = useGetWinemakers();
  // biome-ignore lint/suspicious/noExplicitAny: API response is untyped
  const winemakers = (data || []) as any[];

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
                <TableHead>Status</TableHead>
                <TableHead>Wines</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winemakers.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={6}>
                    No winemakers found
                  </TableCell>
                </TableRow>
              ) : (
                // biome-ignore lint/suspicious/noExplicitAny: API response is untyped
                winemakers.map((winemaker: any) => (
                  <TableRow key={winemaker.id}>
                    <TableCell className="font-medium">{winemaker.name || "—"}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {winemaker.user?.email || "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(winemaker.status || "pending")}`}
                      >
                        {winemaker.status || "pending"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{winemaker.wineCount || "0"} wines</TableCell>
                    <TableCell className="text-sm">
                      {new Date(winemaker.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link
                        className="text-primary hover:underline text-sm"
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
