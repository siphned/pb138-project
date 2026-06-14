import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/primitives/page-header";
import { BundleForm } from "@/components/shops/BundleForm";

export const Route = createFileRoute("/shops/$id/bundles/new")({
  component: BundleNewPage,
});

function BundleNewPage() {
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
        description="Combine wines you already stock into a single bundle for this shop."
        title="Create a bundle"
      />

      <BundleForm
        onSuccess={(productId) => navigate({ params: { productId }, to: "/products/$productId" })}
        shopId={id}
      />
    </div>
  );
}
