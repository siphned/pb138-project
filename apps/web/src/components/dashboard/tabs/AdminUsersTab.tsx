import { Link } from "@tanstack/react-router";
import { useGetAdminUsers } from "@/generated/hooks/useGetAdminUsers";
import { TabPreviewShell } from "./TabPreviewShell";

interface UserRow {
  id: string;
  fname?: string;
  lname?: string;
  email?: string;
  status?: string;
  roles?: string[];
}

export function AdminUsersTab() {
  const query = useGetAdminUsers();
  const raw = query.data;
  const list = (Array.isArray(raw)
    ? raw
    : ((raw as { data?: UserRow[] } | undefined)?.data ?? [])) as UserRow[];
  const users = list.slice(0, 10);
  const hasMore = list.length > 10;

  return (
    <TabPreviewShell
      emptyDescription="Registered users on the platform will show up here."
      emptyTitle="No users yet"
      hasMore={hasMore}
      isEmpty={!query.isLoading && users.length === 0}
      isError={query.isError}
      isLoading={query.isLoading}
      onRetry={() => query.refetch()}
      viewAllTo="/users"
    >
      <ul className="divide-y divide-border rounded-md border border-border">
        {users.map((u) => {
          const name = [u.fname, u.lname].filter(Boolean).join(" ") || "Unnamed";
          return (
            <li key={u.id}>
              <Link
                className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50"
                params={{ id: u.id }}
                to="/users/$id"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-foreground">{name}</span>
                  <p className="text-xs text-muted-foreground">
                    {[u.email, u.roles?.join(", "), u.status].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </TabPreviewShell>
  );
}
