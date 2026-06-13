import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  getRoleRequestsQueryKey,
  useGetRoleRequests,
} from "@/generated/hooks/useGetRoleRequests";
import { usePatchRoleRequestsByIdApprove } from "@/generated/hooks/usePatchRoleRequestsByIdApprove";
import { usePatchRoleRequestsByIdReject } from "@/generated/hooks/usePatchRoleRequestsByIdReject";
import { TabPreviewShell } from "./TabPreviewShell";

interface RoleRequestRow {
  id: string;
  type?: string;
  businessName?: string;
  status?: string;
  createdAt?: string | number;
  user?: { fname?: string; lname?: string; email?: string };
}

function formatDate(value?: string | number) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminRoleRequestsTab() {
  const queryClient = useQueryClient();
  const query = useGetRoleRequests();
  const approve = usePatchRoleRequestsByIdApprove();
  const reject = usePatchRoleRequestsByIdReject();

  const raw = query.data;
  const list = (Array.isArray(raw)
    ? raw
    : ((raw as { data?: RoleRequestRow[] } | undefined)?.data ?? [])) as RoleRequestRow[];
  const pending = list.filter((r) => r.status === "pending" || !r.status);
  const requests = pending.slice(0, 10);
  const hasMore = pending.length > 10;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getRoleRequestsQueryKey() });

  const isBusy = (id: string) =>
    (approve.isPending && approve.variables?.id === id) ||
    (reject.isPending && reject.variables?.id === id);

  return (
    <TabPreviewShell
      emptyDescription="When users request the winemaker or shop-owner role, they show up here."
      emptyTitle="No pending requests"
      hasMore={hasMore}
      isEmpty={!query.isLoading && requests.length === 0}
      isError={query.isError}
      isLoading={query.isLoading}
      onRetry={() => query.refetch()}
      viewAllTo="/role-requests"
    >
      <ul className="divide-y divide-border rounded-md border border-border">
        {requests.map((r) => {
          const name = [r.user?.fname, r.user?.lname].filter(Boolean).join(" ") || r.user?.email;
          const date = formatDate(r.createdAt);
          const busy = isBusy(r.id);
          return (
            <li className="flex items-center justify-between gap-4 p-4" key={r.id}>
              <div className="min-w-0 flex-1">
                <Link
                  className="font-medium text-foreground hover:text-primary"
                  params={{ id: r.id }}
                  to="/role-requests/$id"
                >
                  {r.businessName ?? name ?? "Role request"}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {[r.type, name, date].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  disabled={busy}
                  onClick={() => reject.mutate({ id: r.id }, { onSuccess: invalidate })}
                  size="sm"
                  variant="outline"
                >
                  Decline
                </Button>
                <Button
                  disabled={busy}
                  onClick={() => approve.mutate({ id: r.id }, { onSuccess: invalidate })}
                  size="sm"
                >
                  Accept
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </TabPreviewShell>
  );
}
