"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetWines } from "@/generated/hooks/useGetWines";
import { usePostShopsByIdProducts } from "@/generated/hooks/usePostShopsByIdProducts";
import type { PostShopsByIdProductsMutationRequest } from "@/generated/types/PostShopsByIdProducts";

interface InventoryFormProps {
  shopId: string;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  description?: string;
  price: string;
  quantity: number;
  isBundle: boolean;
  wineId?: string;
  wines?: Array<{ wineId: string; quantity: number }>;
}

export function InventoryForm({ shopId, onSuccess }: InventoryFormProps) {
  const mutation = usePostShopsByIdProducts();
  const { data: winesData } = useGetWines();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBundle, setIsBundle] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      description: "",
      isBundle: false,
      name: "",
      price: "",
      quantity: 0,
      wineId: "",
      wines: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "wines",
  });

  const wines = Array.isArray(winesData) ? winesData : [];

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const submitData = isBundle
        ? {
            description: data.description,
            name: data.name,
            price: data.price,
            quantity: data.quantity,
            wines: data.wines || [],
          }
        : {
            description: data.description,
            name: data.name,
            price: data.price,
            quantity: data.quantity,
            wineId: data.wineId,
          };

      await mutation.mutateAsync({
        data: submitData as PostShopsByIdProductsMutationRequest,
        id: shopId,
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
          name="isBundle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Type</FormLabel>
              <Select
                onValueChange={(value) => {
                  const bundle = value === "bundle";
                  setIsBundle(bundle);
                  field.onChange(bundle);
                }}
                value={isBundle ? "bundle" : "product"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="product">Single Wine</SelectItem>
                  <SelectItem value="bundle">Multi-Wine Bundle</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {isBundle ? "Bundles contain multiple wines" : "Products contain a single wine"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Premium Wine Selection" {...field} />
              </FormControl>
              <FormDescription>The name displayed to customers</FormDescription>
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
                <Input
                  placeholder="e.g., A curated selection of fine wines"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>Additional details about the product</FormDescription>
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
                <Input placeholder="29.99" step="0.01" type="number" {...field} />
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

        {!isBundle ? (
          <FormField
            control={form.control}
            name="wineId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Wine</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a wine..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {wines.map((wine) => (
                      <SelectItem key={wine.id} value={wine.id}>
                        {wine.name} ({wine.winemaker.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>The wine to add to inventory</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Wines in Bundle</FormLabel>
              <Button
                onClick={() => append({ quantity: 1, wineId: "" })}
                size="sm"
                type="button"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Wine
              </Button>
            </div>

            {fields.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No wines added yet. Click "Add Wine" to include wines in this bundle.
              </p>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    className="flex gap-2 items-end p-3 border border-border rounded-lg"
                    key={field.id}
                  >
                    <FormField
                      control={form.control}
                      name={`wines.${index}.wineId`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-xs">Wine</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a wine..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {wines.map((wine) => (
                                <SelectItem key={wine.id} value={wine.id}>
                                  {wine.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`wines.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="w-24">
                          <FormLabel className="text-xs">Qty</FormLabel>
                          <FormControl>
                            <Input min="1" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button onClick={() => remove(index)} size="icon" type="button" variant="ghost">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Button className="w-full" disabled={isSubmitting || mutation.isPending} type="submit">
          {isSubmitting || mutation.isPending ? "Creating..." : "Create Product"}
        </Button>
      </form>
    </Form>
  );
}
