import { createFileRoute } from "@tanstack/react-router";
import { RouteStub } from "./-components/RouteStub";

export const Route = createFileRoute("/_authenticated/_admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  return <RouteStub title="User Management" />;
}
