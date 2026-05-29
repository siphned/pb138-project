import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { ShopForm, type ShopFormValues } from "@/components/shops/ShopForm";
import { useGetShopsById } from "@/generated/hooks/useGetShopsById";
import { usePatchShopsById } from "@/generated/hooks/usePatchShopsById";

export const Route = createFileRoute("/shops/$id/edit")({
  component: ShopEditPage,
});

function ShopEditPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: shop, isLoading, isError, refetch } = useGetShopsById(id);
  const mutation = usePatchShopsById();

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <LoadingState variant="detail" />
      </div>
    );
  }

  if (isError || !shop) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <ErrorState
          message="We couldn't load the shop to edit."
          onRetry={() => refetch()}
          title="Shop not found"
        />
      </div>
    );
  }

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
        id,
      },
      {
        onSuccess: () => navigate({ params: { id }, to: "/shops/$id" }),
      }
    );
  };

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        params={{ id }}
        to="/shops/$id"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to shop
      </Link>

      <PageHeader description="Update your shop's name, description, or address." title="Edit shop" />

      <div className="max-w-2xl">
        <ShopForm
          defaultValues={{
            city: shop.address.city,
            country: shop.address.country,
            description: shop.description ?? "",
            houseNumber: shop.address.houseNumber,
            name: shop.name,
            postalCode: shop.address.postalCode,
            street: shop.address.street,
          }}
          isPending={mutation.isPending}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
