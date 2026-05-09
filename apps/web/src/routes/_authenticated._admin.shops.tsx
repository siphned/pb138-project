import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetShops } from "@/generated/hooks/useGetShops";

export const Route = createFileRoute("/_authenticated/_admin/shops")({
  component: AdminShopsStub,
});

function AdminShopsStub() {
  const query = useGetShops();
  return (
    <StubGet
      title="Admin shops (all)"
      actorRole="admin"
      hookName="useGetShops"
      query={query}
    />
  );
}
