import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/products/$productId")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  return (
    <div className="container mx-auto px-6 py-12">
      <p className="text-muted-foreground">Product detail — coming soon.</p>
    </div>
  );
}
