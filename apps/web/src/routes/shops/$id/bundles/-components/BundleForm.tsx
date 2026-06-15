import { Add01Icon, Delete01Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useGetShopsByIdProducts } from "@/generated/hooks/useGetShopsByIdProducts";
import { usePostShopsByIdProducts } from "@/generated/hooks/usePostShopsByIdProducts";
import type { PostShopsByIdProductsMutationRequest } from "@/generated/types/PostShopsByIdProducts";
import { parseApiError } from "@/lib/api-errors";
import { axiosInstance } from "@/lib/axios";
import { ImageUploadField } from "@/routes/-components/ImageUploadField";
import { SubmitButton } from "@/routes/-components/SubmitButton";
import { TextareaField } from "@/routes/-components/TextareaField";
import { TextField } from "@/routes/-components/TextField";

interface BundleFormProps {
  shopId: string;
  onSuccess: (productId: string) => void;
}

interface BundleFormValues {
  name: string;
  description: string;
  price: string;
  quantity: number;
}

interface SelectedWine {
  wineId: string;
  wineName: string;
  productId: string;
  /** How many of this wine each bundle copy contains. */
  quantity: number;
  /** Shop's current stock of this wine (single-product quantity at add time). */
  productStock: number;
}

interface ShopProductRow {
  id: string;
  name: string;
  quantity: string | number;
  isBundle: boolean;
  wines: Array<{ id: string; name: string }>;
}

async function uploadProductImage(productId: string, file: File): Promise<void> {
  // Generated client serialises { file: Blob } as JSON; multipart needs FormData.
  // Same workaround as shops.$id.images.tsx.
  const fd = new FormData();
  fd.append("file", file);
  await axiosInstance.post(`/products/${productId}/images`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

function friendlyError(code?: string, fallback?: string): string {
  switch (code) {
    case "DUPLICATE_WINE":
      return "Each wine in a bundle must be unique.";
    case "WINE_NOT_FOUND":
      return "One of the selected wines no longer exists.";
    case "INSUFFICIENT_STOCK":
      return "Not enough winemaker stock to allocate this bundle.";
    default:
      return fallback ?? "Couldn't create the bundle. Please check the fields and try again.";
  }
}

export function BundleForm({ shopId, onSuccess }: BundleFormProps) {
  const productsQuery = useGetShopsByIdProducts(shopId, { isBundle: false });
  const mutation = usePostShopsByIdProducts();

  const form = useForm<BundleFormValues>({
    defaultValues: { description: "", name: "", price: "", quantity: 1 },
  });

  const [selected, setSelected] = useState<SelectedWine[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const products = ((productsQuery.data?.data ?? []) as ShopProductRow[]).filter(
    (p) => !p.isBundle && p.wines.length > 0
  );

  const isSelected = (wineId: string) => selected.some((s) => s.wineId === wineId);

  const addToBundle = (product: ShopProductRow) => {
    const wine = product.wines[0];
    if (!wine || isSelected(wine.id)) return;
    setSelected((prev) => [
      ...prev,
      {
        productId: product.id,
        productStock: Number(product.quantity),
        quantity: 1,
        wineId: wine.id,
        wineName: wine.name,
      },
    ]);
  };

  const updateQuantity = (wineId: string, quantity: number) => {
    setSelected((prev) =>
      prev.map((s) => (s.wineId === wineId ? { ...s, quantity: Math.max(1, quantity) } : s))
    );
  };

  const removeFromBundle = (wineId: string) =>
    setSelected((prev) => prev.filter((s) => s.wineId !== wineId));

  // Cap on how many bundles can be listed = min over selected wines of
  // floor(shop stock for that wine / per-bundle quantity).
  const maxBundles =
    selected.length > 0
      ? Math.min(...selected.map((s) => Math.floor(s.productStock / Math.max(1, s.quantity))))
      : 0;

  const validateBundle = (values: BundleFormValues): string | null => {
    if (selected.length < 2) {
      return "A bundle must contain at least 2 wines from your inventory.";
    }
    if (Number(values.quantity) > maxBundles) {
      return `You can list at most ${maxBundles} bundle${maxBundles === 1 ? "" : "s"} with your current stock.`;
    }
    return null;
  };

  const uploadBundleImages = async (productId: string) => {
    for (const file of imageFiles) {
      await uploadProductImage(productId, file);
    }
  };

  const renderInventory = () => {
    if (productsQuery.isLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      );
    }
    if (productsQuery.isError) {
      return (
        <p className="text-sm text-destructive" role="alert">
          Could not load this shop's inventory.
        </p>
      );
    }
    if (products.length === 0) {
      return (
        <div className="rounded-md border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No single-wine products yet. Add some to your inventory first, then come back to bundle
            them.
          </p>
        </div>
      );
    }
    return (
      <ul className="divide-y divide-border rounded-md border border-border">
        {products.map((p) => {
          const stock = Number(p.quantity);
          const outOfStock = stock <= 0;
          const wine = p.wines[0];
          return (
            <li className="flex items-center justify-between gap-4 p-4" key={p.id}>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {wine.name} · {outOfStock ? "Out of stock" : `${stock} in stock`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  aria-label={`View ${p.name}`}
                  render={<Link params={{ productId: p.id }} to="/products/$productId" />}
                  size="icon"
                  variant="ghost"
                >
                  <HugeiconsIcon className="h-4 w-4" icon={ViewIcon} />
                </Button>
                <Button
                  disabled={isSelected(wine.id) || outOfStock}
                  onClick={() => addToBundle(p)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <HugeiconsIcon className="h-4 w-4 mr-1" icon={Add01Icon} />
                  {isSelected(wine.id) ? "Added" : "Add to bundle"}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  const onSubmit = async (values: BundleFormValues) => {
    const validationError = validateBundle(values);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const submitData = {
        description: values.description.trim() || undefined,
        name: values.name,
        price: values.price,
        quantity: Number(values.quantity),
        wines: selected.map((s) => ({ quantity: s.quantity, wineId: s.wineId })),
      };

      const created = await mutation.mutateAsync({
        data: submitData as PostShopsByIdProductsMutationRequest,
        id: shopId,
      });

      const productId = (created as { id?: string } | undefined)?.id;
      if (!productId) return;

      await uploadBundleImages(productId);
      onSuccess(productId);
    } catch (err) {
      const apiError = parseApiError(err);
      setSubmitError(friendlyError(apiError?.code, apiError?.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Pick wines from your inventory
          </h2>
          <p className="text-sm text-muted-foreground">
            Only single-wine products from this shop are shown. Add at least two to make a bundle.
          </p>
        </div>

        {renderInventory()}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Wines in this bundle ({selected.length})
        </h2>

        {selected.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No wines added yet. Pick at least 2 from the list above.
          </p>
        ) : (
          <>
            <ul className="space-y-2">
              {selected.map((s) => {
                const perWineCap = Math.floor(s.productStock / Math.max(1, s.quantity));
                return (
                  <li
                    className="flex items-center gap-3 rounded-md border border-border p-3"
                    key={s.wineId}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.wineName}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.productStock} in shop stock · enables {perWineCap} bundle
                        {perWineCap === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>Qty per bundle</span>
                      <Input
                        className="h-8 w-20"
                        min="1"
                        onChange={(e) => updateQuantity(s.wineId, Number(e.target.value))}
                        type="number"
                        value={s.quantity}
                      />
                    </div>
                    <Button
                      aria-label={`Remove ${s.wineName}`}
                      onClick={() => removeFromBundle(s.wineId)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <HugeiconsIcon className="h-4 w-4 text-destructive" icon={Delete01Icon} />
                    </Button>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-muted-foreground">
              With these wines and per-bundle quantities, you can list up to{" "}
              <strong className="text-foreground">{maxBundles}</strong> bundle
              {maxBundles === 1 ? "" : "s"}.
            </p>
          </>
        )}
      </section>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Bundle details
          </h2>

          <TextField
            control={form.control}
            label="Bundle name"
            name="name"
            placeholder="e.g., Summer Tasting Pack"
          />

          <TextareaField
            control={form.control}
            description="Optional. Shown to customers on the bundle page."
            label="Description"
            name="description"
            placeholder="A short pitch for this bundle"
            rows={3}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (EUR)</FormLabel>
                  <FormControl>
                    <Input placeholder="29.99" step="0.01" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              rules={{
                pattern: {
                  message: "Use a price like 29 or 29.99",
                  value: /^\d+(\.\d{1,2})?$/,
                },
                required: "Price is required",
              }}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bundles available</FormLabel>
                  <FormControl>
                    <Input
                      max={selected.length > 0 ? maxBundles : undefined}
                      min="0"
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {selected.length === 0
                      ? "Pick wines above to compute the maximum."
                      : `Capped at ${maxBundles} based on your current shop stock.`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
              rules={{
                max: {
                  message: `Cannot exceed ${maxBundles} with current stock`,
                  value: selected.length > 0 ? maxBundles : Number.MAX_SAFE_INTEGER,
                },
                min: { message: "Cannot be negative", value: 0 },
              }}
            />
          </div>

          <ImageUploadField
            description="PNG, JPEG, WebP, or AVIF up to 10 MB. Uploaded after the bundle is created."
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
            pendingLabel="Creating…"
          >
            Create Bundle
          </SubmitButton>
        </form>
      </Form>
    </div>
  );
}
