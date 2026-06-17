import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAdminUsers } from "@/generated/hooks/useGetAdminUsers";
import { AdminUserRowMenu } from "@/routes/_authenticated/_admin/-components/AdminUserRowMenu";

export const Route = createFileRoute("/_authenticated/_admin/users")({
  component: AdminUsersPage,
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

function AdminUsersPage() {
  const { data, isLoading, error } = useGetAdminUsers();
  const [search, setSearch] = useState("");
  // biome-ignore lint/suspicious/noExplicitAny: API response is untyped
  const users = (data as any)?.data || [];

  const query = search.trim().toLowerCase();
  const filteredUsers = query
    ? // biome-ignore lint/suspicious/noExplicitAny: API response is untyped
      users.filter((user: any) =>
        [user.email, user.fname, user.name]
          .filter(Boolean)
          .some((field: string) => field.toLowerCase().includes(query))
      )
    : users;

  if (error) {
    return (
      <main className="mx-auto max-w-6xl space-y-4 p-6">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p>Failed to load users: {error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">User Management</h1>

      <Input
        aria-label="Search users"
        className="max-w-sm"
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by email or name…"
        type="search"
        value={search}
      />

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
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={6}>
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                // biome-ignore lint/suspicious/noExplicitAny: API response is untyped
                filteredUsers.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-sm">{user.email}</TableCell>
                    <TableCell>{user.fname || user.name || "—"}</TableCell>
                    <TableCell>
                      {user.roles && user.roles.length > 0
                        ? // biome-ignore lint/suspicious/noExplicitAny: API response is untyped
                          user.roles.map((r: any) => r.role).join(", ")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(user.status)}`}
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <AdminUserRowMenu status={user.status} userId={user.id} />
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
