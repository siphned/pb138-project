import { Add01Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
import { parseApiError } from "@/lib/api-errors";
import { axiosInstance } from "@/lib/axios";
import { ImageUploadField } from "@/routes/-components/ImageUploadField";
import { SubmitButton } from "@/routes/-components/SubmitButton";
import { TextareaField } from "@/routes/-components/TextareaField";
import { TextField } from "@/routes/-components/TextField";

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

async function uploadProductImage(productId: string, file: File): Promise<void> {
  // Generated client posts { file: Blob } as JSON; multipart upload requires FormData,
  // same workaround used in shops.$id.images.tsx.
  const fd = new FormData();
  fd.append("file", file);
  await axiosInstance.post(`/products/${productId}/images`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

function friendlyProductError(code?: string, fallback?: string): string {
  switch (code) {
    case "DUPLICATE_WINE":
      return "Each wine in a bundle must be unique.";
    case "WINE_NOT_FOUND":
      return "One of the selected wines no longer exists.";
    case "INSUFFICIENT_STOCK":
      return "Not enough winemaker stock to allocate this product.";
    default:
      return fallback ?? "Couldn't create the product. Please check the fields and try again.";
  }
}

export function InventoryForm({ shopId, onSuccess }: InventoryFormProps) {
  const mutation = usePostShopsByIdProducts();
  const { data: winesData } = useGetWines();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBundle, setIsBundle] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const validateProduct = (data: FormData): string | null => {
    if (isBundle) {
      const wineRows = (data.wines ?? []).filter((w) => w.wineId);
      if (wineRows.length < 2) return "A bundle must contain at least 2 wines.";
      const wineIds = wineRows.map((w) => w.wineId);
      if (new Set(wineIds).size !== wineIds.length) {
        return "Each wine in a bundle must be unique.";
      }
      return null;
    }
    if (!data.wineId) return "Please select a wine.";
    return null;
  };

  const buildSubmitData = (data: FormData) => {
    // Trim description to undefined when empty — BE requires minLength 1 when present.
    const description = data.description?.trim() ? data.description.trim() : undefined;
    const base = {
      description,
      name: data.name,
      price: data.price,
      quantity: Number(data.quantity),
    };
    if (isBundle) {
      return {
        ...base,
        wines: (data.wines ?? []).map((w) => ({
          quantity: Number(w.quantity),
          wineId: w.wineId,
        })),
      };
    }
    return { ...base, wineId: data.wineId };
  };

  const uploadImages = async (productId: string) => {
    for (const file of imageFiles) {
      await uploadProductImage(productId, file);
    }
  };

  const onSubmit = async (data: FormData) => {
    const validationError = validateProduct(data);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const created = await mutation.mutateAsync({
        data: buildSubmitData(data) as PostShopsByIdProductsMutationRequest,
        id: shopId,
      });

      const productId = (created as { id?: string } | undefined)?.id;
      if (productId && imageFiles.length > 0) {
        await uploadImages(productId);
      }

      onSuccess();
    } catch (err) {
      const apiError = parseApiError(err);
      setSubmitError(friendlyProductError(apiError?.code, apiError?.message));
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

        <TextField
          control={form.control}
          description="The name displayed to customers"
          label="Product Name"
          name="name"
          placeholder="e.g., Premium Wine Selection"
        />

        <TextareaField
          control={form.control}
          description="Additional details about the product"
          label="Description (Optional)"
          name="description"
          placeholder="e.g., A curated selection of fine wines"
          rows={3}
        />

        <TextField
          control={form.control}
          description="Price per unit"
          label="Price (EUR)"
          name="price"
          placeholder="29.99"
          step="0.01"
          type="number"
        />

        <TextField
          control={form.control}
          description="Number of units in stock"
          label="Quantity"
          min="0"
          name="quantity"
          type="number"
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
                <HugeiconsIcon className="h-4 w-4 mr-1" icon={Add01Icon} />
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
                      <HugeiconsIcon className="h-4 w-4 text-destructive" icon={Delete01Icon} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <ImageUploadField
          description="PNG, JPEG, WebP, or AVIF up to 10 MB. Uploaded after the product is created."
          onErrorChange={setImageError}
          onFilesChange={setImageFiles}
        />

        {submitError && (
          <p className="text-sm text-destructive" role="alert">
            {submitError}
          </p>
        )}

        <SubmitButton
          disabled={!!imageError}
          isPending={isSubmitting || mutation.isPending}
          pendingLabel="Creating..."
        >
          Create Product
        </SubmitButton>
      </form>
    </Form>
  );
}
