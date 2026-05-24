import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetRoleRequestsById } from "@/generated/hooks/useGetRoleRequestsById";
import { usePatchRoleRequestsByIdApprove } from "@/generated/hooks/usePatchRoleRequestsByIdApprove";
import { usePatchRoleRequestsByIdReject } from "@/generated/hooks/usePatchRoleRequestsByIdReject";

export const Route = createFileRoute("/_authenticated/_admin/role-requests/$id")({
  component: RoleRequestDetailPage,
});

function statusBadgeClass(status: string) {
  if (status === "approved") return "bg-green-100/30 text-green-700 dark:text-green-400";
  if (status === "rejected") return "bg-destructive/30 text-destructive";
  return "bg-yellow-100/30 text-yellow-700 dark:text-yellow-400";
}

function RoleRequestDetailPage() {
  const { id } = Route.useParams();
  const { data, isLoading, isError, refetch } = useGetRoleRequestsById(id);
  const approveMutation = usePatchRoleRequestsByIdApprove();
  const rejectMutation = usePatchRoleRequestsByIdReject();

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton className="h-6 w-full" key={i} />
        ))}
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 p-6">
        <p className="text-destructive">Failed to load role request.</p>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </main>
    );
  }

  const req = data;
  const isPending = req.status === "pending";
  const isActing = approveMutation.isPending || rejectMutation.isPending;

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link className="text-sm text-muted-foreground hover:text-foreground" to="/dashboard">
          ← Role Requests
        </Link>
      </div>

      <h1 className="text-2xl font-semibold">Role Request</h1>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Business Name</p>
            <p className="font-medium">{req.businessName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Requested Role</p>
            <p className="font-medium capitalize">{req.type?.replace("_", " ")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(req.status)}`}
            >
              {req.status}
            </span>
          </div>
          <div>
            <p className="text-muted-foreground">Submitted</p>
            <p className="font-medium">
              {req.submittedAt ? new Date(req.submittedAt).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>

        {req.details && (
          <>
            <Separator />
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Details</p>
              <p className="text-sm">{req.details}</p>
            </div>
          </>
        )}
      </div>

      {isPending && (
        <div className="flex gap-3">
          <Button
            disabled={isActing}
            onClick={() => approveMutation.mutate({ id }, { onSuccess: () => refetch() })}
          >
            {approveMutation.isPending ? "Approving..." : "Approve"}
          </Button>
          <Button
            disabled={isActing}
            onClick={() => rejectMutation.mutate({ id }, { onSuccess: () => refetch() })}
            variant="destructive"
          >
            {rejectMutation.isPending ? "Rejecting..." : "Reject"}
          </Button>
        </div>
      )}

      {(approveMutation.isError || rejectMutation.isError) && (
        <p className="text-sm text-destructive">Action failed. Please try again.</p>
      )}
    </main>
  );
}
