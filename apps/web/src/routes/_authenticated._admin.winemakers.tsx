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
      title="Admin winemakers (all)"
      role="admin"
      hookName="useGetWinemakers"
      query={query}
    />
  );
}
