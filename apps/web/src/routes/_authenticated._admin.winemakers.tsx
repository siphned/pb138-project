import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";

export const Route = createFileRoute("/_authenticated/_admin/winemakers")({
  component: AdminWinemakersStub,
});

function AdminWinemakersStub() {
  const query = useGetWinemakers();
  return (
    <StubGet
      actorRole="admin"
      hookName="useGetWinemakers"
      query={query}
      title="Admin winemakers (all)"
    />
  );
}
