import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAdminUsersById } from "@/generated/hooks/useGetAdminUsersById";
import { usePatchAdminUsersByIdStatus } from "@/generated/hooks/usePatchAdminUsersByIdStatus";

export const Route = createFileRoute("/_authenticated/_admin/users/$id")({
  component: AdminUserDetailPage,
});

function UserStatusAction({
  id,
  isSuspended,
  onSuccess,
}: {
  id: string;
  isSuspended: boolean;
  onSuccess: () => void;
}) {
  const statusMutation = usePatchAdminUsersByIdStatus();

  if (isSuspended) {
    return (
      <div className="flex gap-3">
        <Button
          disabled={statusMutation.isPending}
          onClick={() => statusMutation.mutate({ data: { status: "active" }, id }, { onSuccess })}
          variant="outline"
        >
          {statusMutation.isPending ? "Reactivating..." : "Reactivate Account"}
        </Button>
        {statusMutation.isError && (
          <p className="self-center text-sm text-destructive">Action failed.</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Button
        disabled={statusMutation.isPending}
        onClick={() => statusMutation.mutate({ data: { status: "suspended" }, id }, { onSuccess })}
        variant="destructive"
      >
        {statusMutation.isPending ? "Suspending..." : "Suspend Account"}
      </Button>
      {statusMutation.isError && (
        <p className="self-center text-sm text-destructive">Action failed.</p>
      )}
    </div>
  );
}

function AdminUserDetailPage() {
  const { id } = Route.useParams();
  const { data, isLoading, isError, refetch } = useGetAdminUsersById(id);

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
        <p className="text-destructive">Failed to load user.</p>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </main>
    );
  }

  // biome-ignore lint/suspicious/noExplicitAny: API response is untyped
  const user = data as Record<string, any>;
  const isSuspended = user.status === "suspended" || user.status === "banned";

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link className="text-sm text-muted-foreground hover:text-foreground" to="/dashboard">
          ← Users
        </Link>
      </div>

      <h1 className="text-2xl font-semibold">User Details</h1>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="font-medium">
              {[user.firstName, user.lastName].filter(Boolean).join(" ") || user.name || "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{user.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Roles</p>
            <p className="font-medium">
              {Array.isArray(user.roles) ? user.roles.join(", ") : (user.role ?? "—")}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                isSuspended
                  ? "bg-destructive/30 text-destructive"
                  : "bg-green-100/30 text-green-700 dark:text-green-400"
              }`}
            >
              {user.status ?? "active"}
            </span>
          </div>
          {user.createdAt && (
            <div>
              <p className="text-muted-foreground">Joined</p>
              <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        <Separator />

        <UserStatusAction id={id} isSuspended={isSuspended} onSuccess={() => refetch()} />
      </div>
    </main>
  );
}
