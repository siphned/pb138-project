import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft02Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/components/primitives/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteShopsById } from "@/generated/hooks/useDeleteShopsById";
import { useGetShopsByIdSuspense } from "@/generated/hooks/useGetShopsByIdSuspense";
import { usePatchShopsById } from "@/generated/hooks/usePatchShopsById";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shops/$id/edit")({
  component: ShopEditPage,
});

const shopEditSchema = z.object({
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  description: z.string().min(1, "Description is required"),
  houseNumber: z.string().min(1, "House number is required"),
  name: z.string().min(1, "Name is required").max(255),
  postalCode: z.string().min(1, "Postal code is required"),
  street: z.string().min(1, "Street is required"),
});

type ShopEditFormValues = z.infer<typeof shopEditSchema>;

// biome-ignore lint/suspicious/noExplicitAny: shop data is untyped from Suspense hook
function getShopDefaults(shop: Record<string, any>): ShopEditFormValues {
  return {
    city: shop.address?.city ?? "",
    country: shop.address?.country ?? "",
    description: shop.description ?? "",
    houseNumber: shop.address?.houseNumber ?? "",
    name: shop.name ?? "",
    postalCode: shop.address?.postalCode ?? "",
    street: shop.address?.street ?? "",
  };
}

function StatusMessage({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div
      className={cn(
        "rounded-md p-4",
        type === "success"
          ? "border border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
          : "border border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      )}
    >
      {message}
    </div>
  );
}

function ShopEditPage() {
  const { id } = Route.useParams();

  return (
    <Suspense
      fallback={
        <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
          <PageHeader title="Edit Shop" />
          <div className="space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton className="h-12 w-full" key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ShopEditContent id={id} />
    </Suspense>
  );
}

function ShopEditContent({ id }: { id: string }) {
  const navigate = useNavigate();
  const { data: shop } = useGetShopsByIdSuspense(id);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const patchMutation = usePatchShopsById({
    mutation: {
      onError: (error) => {
        setStatusMessage({
          message: error.message || "Failed to update shop",
          type: "error",
        });
      },
      onSuccess: () => {
        setStatusMessage({
          message: "Shop updated successfully!",
          type: "success",
        });
        setTimeout(() => navigate({ to: `/shops/${id}` }), 1500);
      },
    },
  });

  const form = useForm<ShopEditFormValues>({
    defaultValues: getShopDefaults(shop),
    resolver: zodResolver(shopEditSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit: SubmitHandler<ShopEditFormValues> = (data) => {
    patchMutation.mutate({
      data: {
        address: {
          city: data.city,
          country: data.country,
          houseNumber: data.houseNumber,
          postalCode: data.postalCode,
          street: data.street,
        },
        description: data.description,
        name: data.name,
      },
      id,
    });
  };

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <PageHeader
        actions={
          <Button render={<Link params={{ id }} to="/shops/$id" />} size="sm" variant="outline">
            <HugeiconsIcon className="mr-2 h-4 w-4" icon={ArrowLeft02Icon} />
            Back to Shop
          </Button>
        }
        description={`Updating: ${shop.name}`}
        title="Edit Shop"
      />

      {statusMessage && <StatusMessage message={statusMessage.message} type={statusMessage.type} />}

      <form
        className="max-w-2xl space-y-6 rounded-lg border border-border bg-card p-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>

          <div>
            <Label htmlFor="name">
              Shop Name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" placeholder="e.g., The Wine Cellar" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your shop..."
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Address</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="street">
                Street <span className="text-destructive">*</span>
              </Label>
              <Input id="street" placeholder="e.g., Main Street" {...register("street")} />
              {errors.street && (
                <p className="mt-1 text-xs text-destructive">{errors.street.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="houseNumber">
                House Number <span className="text-destructive">*</span>
              </Label>
              <Input id="houseNumber" placeholder="e.g., 42" {...register("houseNumber")} />
              {errors.houseNumber && (
                <p className="mt-1 text-xs text-destructive">{errors.houseNumber.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input id="city" placeholder="e.g., Dublin" {...register("city")} />
              {errors.city && (
                <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="postalCode">
                Postal Code <span className="text-destructive">*</span>
              </Label>
              <Input id="postalCode" placeholder="e.g., D02 XY12" {...register("postalCode")} />
              {errors.postalCode && (
                <p className="mt-1 text-xs text-destructive">{errors.postalCode.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="country">
              Country <span className="text-destructive">*</span>
            </Label>
            <Input id="country" placeholder="e.g., Ireland" {...register("country")} />
            {errors.country && (
              <p className="mt-1 text-xs text-destructive">{errors.country.message}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button
            className="flex-1"
            disabled={isSubmitting || patchMutation.isPending}
            type="submit"
          >
            {patchMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            className="flex-1"
            onClick={() => navigate({ to: `/shops/${id}` })}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <ShopDeleteSection id={id} />
    </div>
  );
}

function ShopDeleteSection({ id }: { id: string }) {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const deleteMutation = useDeleteShopsById({
    mutation: { onSuccess: () => navigate({ to: "/shops" }) },
  });

  return (
    <div className="max-w-2xl rounded-lg border border-destructive/50 bg-card p-6">
      <h2 className="mb-2 text-lg font-semibold text-destructive">Danger Zone</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Permanently delete this shop. This action cannot be undone.
      </p>

      {!deleteConfirm ? (
        <Button onClick={() => setDeleteConfirm(true)} type="button" variant="destructive">
          <HugeiconsIcon className="mr-2 h-4 w-4" icon={Delete01Icon} />
          Delete Shop
        </Button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-destructive">
            Are you sure? This will permanently delete the shop.
          </p>
          <div className="flex gap-3">
            <Button
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate({ id })}
              type="button"
              variant="destructive"
            >
              {deleteMutation.isPending ? "Deleting..." : "Yes, delete shop"}
            </Button>
            <Button onClick={() => setDeleteConfirm(false)} type="button" variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
