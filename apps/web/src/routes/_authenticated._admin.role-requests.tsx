import { createFileRoute } from "@tanstack/react-router";
import { RouteStub } from "./-components/RouteStub";

export const Route = createFileRoute("/_authenticated/_admin/role-requests")({
  component: RoleRequestsPage,
});

function RoleRequestsPage() {
  return <RouteStub title="Role Requests" />;
}
