import {
  ArrowLeft02Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  Image01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { Section } from "@/components/primitives/section";
import { ShopForm, type ShopFormValues } from "@/components/shops/ShopForm";
import { Card, CardContent } from "@/components/ui/card";
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

      <Section heading="More setup">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link params={{ id }} to="/shops/$id/images">
            <Card className="transition-colors hover:border-primary" variant="section">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <HugeiconsIcon className="h-5 w-5" icon={Image01Icon} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Manage images</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload photos so customers recognise your shop.
                  </p>
                </div>
                <HugeiconsIcon
                  className="mt-2 h-4 w-4 shrink-0 text-muted-foreground"
                  icon={ArrowRight01Icon}
                />
              </CardContent>
            </Card>
          </Link>

          <Link params={{ id }} to="/shops/$id/availability">
            <Card className="transition-colors hover:border-primary" variant="section">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <HugeiconsIcon className="h-5 w-5" icon={Calendar03Icon} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Opening hours</h3>
                  <p className="text-sm text-muted-foreground">
                    Set your regular weekly hours and any exceptions.
                  </p>
                </div>
                <HugeiconsIcon
                  className="mt-2 h-4 w-4 shrink-0 text-muted-foreground"
                  icon={ArrowRight01Icon}
                />
              </CardContent>
            </Card>
          </Link>
        </div>
      </Section>
    </div>
  );
}
