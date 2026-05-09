import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/dev/StubPage";

export const Route = createFileRoute("/_authenticated/_admin/role-requests/$id")({
  component: AdminRoleRequestDetailStub,
});

function AdminRoleRequestDetailStub() {
  const { id } = Route.useParams();
  return (
    <StubPage title={`Admin: Role Request ${id}`} role="admin" hookName="useGetRoleRequestsById (MISSING BE)">
      <p className="text-destructive">
        Hook <code>useGetRoleRequestsById</code> not present in generated client.
        Backend endpoint missing or Orval has not regenerated. Recorded in audit.
      </p>
    </StubPage>
  );
}
