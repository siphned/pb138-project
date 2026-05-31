import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/primitives/page-header";
import { ShopForm, type ShopFormValues } from "@/components/shops/ShopForm";
import { usePostShops } from "@/generated/hooks/usePostShops";

export const Route = createFileRoute("/shops/new")({
  component: ShopCreatePage,
});

function ShopCreatePage() {
  const navigate = useNavigate();
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
        onSuccess: (created) => {
          // Land on the edit page so the user can immediately add images
          // and opening hours for the shop they just created.
          navigate({ params: { id: created.id }, to: "/shops/$id/edit" });
        },
      }
    );
  };

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
