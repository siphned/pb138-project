import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/primitives/page-header";

export const Route = createFileRoute("/products/$productId/edit")({
  component: EditProductPage,
});

function EditProductPage() {
  const { productId } = Route.useParams();

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <PageHeader
        description={`Editing product ${productId}. Forms coming in owner-side epic.`}
        title="Edit Product"
      />
      <div className="rounded-xl border border-dashed border-border p-20 text-center">
        <p className="text-muted-foreground">TODO: Implement product edit form.</p>
      </div>
    </div>
  );
}
