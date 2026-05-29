import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/primitives/page-header";
import { InventoryForm } from "@/components/shops/InventoryForm";

export const Route = createFileRoute("/shops/$id/inventory/new")({
  component: InventoryNewPage,
});

function InventoryNewPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        params={{ id }}
        search={{ isBundle: undefined }}
        to="/shops/$id/inventory"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to inventory
      </Link>

      <PageHeader
        description="Add a single product or a multi-wine bundle to this shop's catalog."
        title="Add inventory"
      />

      <InventoryForm
        onSuccess={() =>
          navigate({ params: { id }, search: { isBundle: undefined }, to: "/shops/$id/inventory" })
        }
        shopId={id}
      />
    </div>
  );
}
