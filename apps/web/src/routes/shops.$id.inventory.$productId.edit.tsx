import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/components/primitives/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useGetProductsByIdSuspense } from "@/generated/hooks/useGetProductsByIdSuspense";
import { usePatchShopsByIdProductsByProductId } from "@/generated/hooks/usePatchShopsByIdProductsByProductId";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shops/$id/inventory/$productId/edit")({
  component: ShopProductEditPage,
});

const schema = z.object({
  description: z.string().optional(),
  name: z.string().min(1, "Name is required").max(255),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Must be a valid price (e.g. 12.99)"),
  quantity: z.coerce.number().min(0, "Quantity must be 0 or more"),
});

type FormValues = z.infer<typeof schema>;

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

function ProductEditContent({ shopId, productId }: { shopId: string; productId: string }) {
  const { data: product } = useGetProductsByIdSuspense(productId);
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const p = product as Record<string, unknown>;

  const mutation = usePatchShopsByIdProductsByProductId({
    mutation: {
      onError: (error) => {
        setStatusMessage({
          message: (error as Error).message || "Failed to update product",
          type: "error",
        });
      },
      onSuccess: () => {
        setStatusMessage({ message: "Product updated successfully!", type: "success" });
        setTimeout(() => navigate({ to: `/shops/${shopId}/inventory` }), 1500);
      },
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      description: (p.description as string) ?? "",
      name: (p.name as string) ?? "",
      price: (p.price as string) ?? "",
      quantity: (p.quantity as number) ?? 0,
    },
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    mutation.mutate({
      data: {
        description: values.description || null,
        name: values.name,
        price: values.price,
        quantity: values.quantity,
      },
      id: shopId,
      productId,
    });
  };

  return (
    <div className="container mx-auto max-w-2xl space-y-8 px-6 py-8 lg:px-12">
      <PageHeader
        description="Update product details, pricing, and stock."
        title={(p.name as string) ? `Edit: ${p.name as string}` : "Edit Product"}
      />

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            className="resize-none"
            id="description"
            rows={3}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (€)</Label>
            <Input id="price" placeholder="12.99" {...register("price")} />
            {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Stock Quantity</Label>
            <Input id="quantity" min={0} type="number" {...register("quantity")} />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>
        </div>

        {statusMessage && (
          <StatusMessage message={statusMessage.message} type={statusMessage.type} />
        )}

        <div className="flex gap-3">
          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            onClick={() => navigate({ to: `/shops/${shopId}/inventory` })}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function ShopProductEditPage() {
  const { id: shopId, productId } = Route.useParams();

  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-2xl space-y-8 px-6 py-8 lg:px-12">
          <PageHeader title="Edit Product" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton className="h-12 w-full" key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ProductEditContent productId={productId} shopId={shopId} />
    </Suspense>
  );
}
