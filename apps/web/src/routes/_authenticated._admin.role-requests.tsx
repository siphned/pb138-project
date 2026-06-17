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
import { useGetRoleRequests } from "@/generated/hooks/useGetRoleRequests";

export const Route = createFileRoute("/_authenticated/_admin/role-requests")({
  component: RoleRequestsPage,
});

function getStatusBadgeClass(status: string): string {
  if (status === "approved") {
    return "bg-green-100/30 text-green-700 dark:text-green-400";
  }
  if (status === "rejected") {
    return "bg-destructive/30 text-destructive dark:text-red-400";
  }
  return "bg-yellow-100/30 text-yellow-700 dark:text-yellow-400";
}

function RoleRequestsPage() {
  const { data, isLoading, error } = useGetRoleRequests();
  const requests = data || [];

  if (error) {
    return (
      <main className="mx-auto max-w-6xl space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Role Requests</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p>
            Failed to load role requests: {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Role Requests</h1>

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
                <TableHead>Business Name</TableHead>
                <TableHead>Requested Role</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={6}>
                    No pending role requests
                  </TableCell>
                </TableRow>
              ) : (
                // biome-ignore lint/suspicious/noExplicitAny: API response is untyped
                requests.map((request: any) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.businessName}</TableCell>
                    <TableCell>
                      <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-blue-100/30 text-blue-700 dark:text-blue-400">
                        {request.type === "winemaker" ? "Winemaker" : "Shop Owner"}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm">
                      {request.details || "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(request.status)}`}
                      >
                        {request.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(request.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link
                        className="text-primary hover:underline text-sm"
                        params={{ id: request.id }}
                        to="/role-requests/$id"
                      >
                        Review
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
