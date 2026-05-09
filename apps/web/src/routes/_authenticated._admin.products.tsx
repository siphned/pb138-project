import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetProducts } from "@/generated/hooks/useGetProducts";

export const Route = createFileRoute("/_authenticated/_admin/products")({
  component: AdminProductsStub,
});

function AdminProductsStub() {
  const query = useGetProducts();
  return (
    <StubGet
      title="Admin products (all)"
      actorRole="admin"
      hookName="useGetProducts"
      query={query}
    />
  );
}
