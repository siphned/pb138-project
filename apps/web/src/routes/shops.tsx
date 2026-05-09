import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetShops } from "@/generated/hooks/useGetShops";

export const Route = createFileRoute("/shops")({
  component: ShopsListStub,
  validateSearch: (search) => ({
    q: typeof search.q === "string" ? search.q : undefined,
    city: typeof search.city === "string" ? search.city : undefined,
    ownerUserId: typeof search.ownerUserId === "string" ? search.ownerUserId : undefined,
  }),
});

function ShopsListStub() {
  const search = Route.useSearch();
  const query = useGetShops(search);
  return (
    <StubGet
      title={`Shops${Object.keys(search).length ? " (filtered)" : ""}`}
      role="guest+ / shop_owner"
      hookName="useGetShops"
      query={query}
    />
  );
}
