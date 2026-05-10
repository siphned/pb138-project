import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/dev/StubPage";

export const Route = createFileRoute("/_authenticated/_admin/users/$id")({
  component: AdminUserDetailStub,
});

function AdminUserDetailStub() {
  const { id } = Route.useParams();
  return (
    <StubPage
      actorRole="admin"
      hookName="useGetAdminUsersById (MISSING BE)"
      title={`Admin: User ${id}`}
    >
      <p className="text-destructive">
        Hook <code>useGetAdminUsersById</code> not present in generated client. Backend endpoint
        missing or Orval has not regenerated. Recorded in audit.
      </p>
    </StubPage>
  );
}
