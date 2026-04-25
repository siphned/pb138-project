import { createFileRoute } from "@tanstack/react-router";
import { RouteStub } from "./-components/RouteStub";

export const Route = createFileRoute("/_authenticated/_admin/admin")({
  component: AdminPage,
});

function AdminPage() {
  return <RouteStub title="Admin Back-office" />;
}
