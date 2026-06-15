import { createFileRoute } from "@tanstack/react-router";
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import { StubGet } from "@/routes/-components/StubGet";

export const Route = createFileRoute("/_authenticated/_admin/products")({
  component: AdminProductsStub,
});

function AdminProductsStub() {
  const query = useGetProducts();
  return (
    <StubGet
      actorRole="admin"
      hookName="useGetProducts"
      query={query}
      title="Admin products (all)"
    />
  );
}
