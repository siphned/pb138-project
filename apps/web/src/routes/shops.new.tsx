import { ArrowLeft02Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/primitives/page-header";
import { ShopForm, type ShopFormValues } from "@/components/shops/ShopForm";
import { ShopMoreSetupCards } from "@/components/shops/ShopMoreSetupCards";
import { Button } from "@/components/ui/button";
import { useGetShopsById } from "@/generated/hooks/useGetShopsById";
import { usePostShops } from "@/generated/hooks/usePostShops";

interface ShopNewSearch {
  /** When set, the page is showing the post-create success state for this shop. */
  created?: string;
}

export const Route = createFileRoute("/shops/new")({
  component: ShopCreatePage,
  validateSearch: (search): ShopNewSearch => {
    const raw = (search as { created?: unknown }).created;
    return typeof raw === "string" && raw.length > 0 ? { created: raw } : {};
  },
});

function ShopCreatePage() {
  const navigate = useNavigate();
  const { created } = Route.useSearch();
  const mutation = usePostShops();

  const handleSubmit = (values: ShopFormValues) => {
    mutation.mutate(
      {
        data: {
          address: {
            city: values.city,
            country: values.country,
            houseNumber: values.houseNumber,
            postalCode: values.postalCode,
            street: values.street,
          },
          description: values.description,
          name: values.name,
        },
      },
      {
        onSuccess: (createdShop) => {
          // Park the success state in the URL so a round-trip to images /
          // opening hours and back via the Done button lands back here.
          navigate({
            replace: true,
            search: { created: createdShop.id },
            to: "/shops/new",
          });
        },
      }
    );
  };

  if (created) return <ShopCreatedSuccess shopId={created} />;

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        to="/shops"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to shops
      </Link>

      <PageHeader
        description="Create your retail shop so customers can browse and order your products."
        title="Create a new shop"
      />

      <div className="max-w-2xl">
        <ShopForm
          defaultValues={{}}
          isPending={mutation.isPending}
          onSubmit={handleSubmit}
          submitLabel="Create shop"
        />
      </div>
    </div>
  );
}

function ShopCreatedSuccess({ shopId }: { shopId: string }) {
  // Re-fetch the just-created shop so the success header survives navigation
  // away and back. Name is stable so the fetch is cheap on hot cache.
  const { data: shop } = useGetShopsById(shopId);
  const shopName = shop?.name ?? "Your shop";

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        to="/shops"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to shops
      </Link>

      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <HugeiconsIcon className="mt-1 h-6 w-6 text-primary" icon={CheckmarkCircle02Icon} />
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {shopName} is live
            </h1>
            <p className="text-sm text-muted-foreground">
              Finish setting up your shop below so customers can find you.
            </p>
          </div>
        </div>
      </div>

      <ShopMoreSetupCards heading="Finish setup" shopId={shopId} />

      <div className="flex justify-end gap-2">
        <Button
          render={<Link params={{ id: shopId }} to="/shops/$id/edit" />}
          variant="outline"
        >
          Edit shop details
        </Button>
        <Button render={<Link params={{ id: shopId }} to="/shops/$id" />}>View shop</Button>
      </div>
    </div>
  );
}
