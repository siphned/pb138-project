"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { usePatchShopsByIdProductsByProductId } from "@/generated/hooks/usePatchShopsByIdProductsByProductId";
import type { GetShopsByIdProducts200 } from "@/generated/types/GetShopsByIdProducts";
import type { PatchShopsByIdProductsByProductIdMutationRequest } from "@/generated/types/PatchShopsByIdProductsByProductId";

interface InventoryEditFormProps {
  shopId: string;
  product: GetShopsByIdProducts200["data"][number];
  onSuccess: () => void;
  onCancel: () => void;
}

export function InventoryEditForm({
  shopId,
  product,
  onSuccess,
  onCancel,
}: InventoryEditFormProps) {
  const mutation = usePatchShopsByIdProductsByProductId();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PatchShopsByIdProductsByProductIdMutationRequest>({
    defaultValues: {
      // The list-item type omits description, but the edit page passes the full
      // product (which has it), so prefill it to avoid wiping it on save.
      description: (product as { description?: string | null }).description ?? "",
      name: product.name,
      price: product.price,
      quantity: Number(product.quantity),
    },
  });

  const onSubmit = async (data: PatchShopsByIdProductsByProductIdMutationRequest) => {
    setIsSubmitting(true);
    try {
      // Number inputs hand back strings, and the backend rejects an empty
      // description (it must be omitted/null), so normalize before sending.
      const description = typeof data.description === "string" ? data.description.trim() : "";
      await mutation.mutateAsync({
        data: {
          ...data,
          description: description.length > 0 ? description : null,
          quantity: Number(data.quantity),
        },
        id: shopId,
        productId: product.id,
      });
      onSuccess();
    } catch (_error) {
      // Error handling is delegated to the mutation hook's error state
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price (EUR)</FormLabel>
              <FormControl>
                <Input step="0.01" type="number" {...field} />
              </FormControl>
              <FormDescription>Price per unit</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input min="0" type="number" {...field} />
              </FormControl>
              <FormDescription>Number of units in stock</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button className="flex-1" onClick={onCancel} type="button" variant="outline">
            Cancel
          </Button>
          <Button className="flex-1" disabled={isSubmitting || mutation.isPending} type="submit">
            {isSubmitting || mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
