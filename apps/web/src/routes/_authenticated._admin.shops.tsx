import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetShops } from "@/generated/hooks/useGetShops";

export const Route = createFileRoute("/_authenticated/_admin/shops")({
  component: AdminShopsStub,
});

function AdminShopsStub() {
  const query = useGetShops();
  return (
    <StubGet actorRole="admin" hookName="useGetShops" query={query} title="Admin shops (all)" />
  );
}
