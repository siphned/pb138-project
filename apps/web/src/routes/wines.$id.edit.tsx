import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Suspense, useMemo, useState } from "react";
import { type Resolver, type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/components/primitives/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useGetWinesByIdSuspense } from "@/generated/hooks/useGetWinesByIdSuspense";
import { usePutWinesById } from "@/generated/hooks/usePutWinesById";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/wines/$id/edit")({
  component: WineEditPage,
});

const wineEditSchema = z.object({
  alcoholContent: z.string().regex(/^\d{1,2}(\.\d{1,2})?$/, "Invalid alcohol content format"),
  attribution: z.string().min(1, "Attribution is required"),
  color: z.enum(["red", "white", "rosé", "orange", "gray", "tawny", "yellow"]),
  composition: z.string().min(1, "Composition is required"),
  description: z.string().min(1, "Description is required"),
  name: z.string().min(1, "Name is required").max(255, "Name must be at most 255 characters"),
  quantity: z.coerce.number().min(0),
  region: z.string().min(1, "Region is required").max(255),
  type: z.enum(["still", "sparkling", "fortified", "dessert"]),
  vintageYear: z.coerce.number().min(1800).max(2100),
  volumeMl: z.coerce.number().min(1),
});

type WineEditFormValues = z.infer<typeof wineEditSchema>;

function WineEditPage() {
  const { id } = Route.useParams();

  return (
    <Suspense
      fallback={
        <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
          <PageHeader title="Edit Wine" />
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton className="h-12 w-full" key={i} />
            ))}
          </div>
        </div>
      }
    >
      <WineEditContent id={id} />
    </Suspense>
  );
}

function StatusMessage({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div
      className={cn(
        "rounded-md border p-4",
        type === "success"
          ? "border-success/20 bg-success/5 text-success"
          : "border-destructive/20 bg-destructive/5 text-destructive"
      )}
    >
      {message}
    </div>
  );
}
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Form setup with hooks requires multiple conditional branches
function WineEditContent({ id }: { id: string }) {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { data: wine } = useGetWinesByIdSuspense(id);
  const mutation = usePutWinesById({
    mutation: {
      onError: (error) => {
        setStatusMessage({
          message: error.message || "Failed to update wine",
          type: "error",
        });
      },
      onSuccess: () => {
        setStatusMessage({
          message: "Wine updated successfully!",
          type: "success",
        });
        setTimeout(() => navigate({ to: `/wines/${id}` }), 1500);
      },
    },
  });

  const resolver = useMemo<Resolver<WineEditFormValues>>(
    () => async (values) => {
      const result = wineEditSchema.safeParse(values);
      if (result.success) return { errors: {}, values: result.data };
      const errs: Record<string, { type: string; message: string }> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string;
        if (path && !errs[path]) errs[path] = { message: issue.message, type: "manual" };
      }
      return { errors: errs as never, values: {} };
    },
    []
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WineEditFormValues>({
    defaultValues: {
      alcoholContent: wine.alcoholContent || "",
      attribution: wine.attribution || "",
      color: (wine.color as WineEditFormValues["color"]) || "red",
      composition: wine.composition || "",
      description: wine.description || "",
      name: wine.name || "",
      quantity: Number(wine.quantity) || 0,
      region: wine.region || "",
      type: (wine.type as WineEditFormValues["type"]) || "still",
      vintageYear: Number(wine.vintageYear) || 2020,
      volumeMl: Number(wine.volumeMl) || 750,
    },
    resolver,
  });

  const color = watch("color");
  const type = watch("type");

  const onSubmit: SubmitHandler<WineEditFormValues> = (data) => {
    mutation.mutate({
      data: {
        ...data,
        quantity: data.quantity,
        vintageYear: data.vintageYear,
        volumeMl: data.volumeMl,
      },
      id,
    });
  };

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <PageHeader description={`Updating: ${wine.name}`} title="Edit Wine" />

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
              Wine Name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" placeholder="e.g., Château Margaux" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe this wine..."
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Wine Properties */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Wine Properties</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color">
                Color <span className="text-destructive">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue("color", value as WineEditFormValues["color"])}
                value={color}
              >
                <SelectTrigger id="color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="rosé">Rosé</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                  <SelectItem value="gray">Gray</SelectItem>
                  <SelectItem value="tawny">Tawny</SelectItem>
                  <SelectItem value="yellow">Yellow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue("type", value as WineEditFormValues["type"])}
                value={type}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="still">Still</SelectItem>
                  <SelectItem value="sparkling">Sparkling</SelectItem>
                  <SelectItem value="fortified">Fortified</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="alcoholContent">
                Alcohol Content % <span className="text-destructive">*</span>
              </Label>
              <Input id="alcoholContent" placeholder="e.g., 13.5" {...register("alcoholContent")} />
              {errors.alcoholContent && (
                <p className="mt-1 text-xs text-destructive">{errors.alcoholContent.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="volumeMl">
                Volume (mL) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="volumeMl"
                placeholder="e.g., 750"
                type="number"
                {...register("volumeMl")}
              />
              {errors.volumeMl && (
                <p className="mt-1 text-xs text-destructive">{errors.volumeMl.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vintageYear">
                Vintage Year <span className="text-destructive">*</span>
              </Label>
              <Input
                id="vintageYear"
                max="2100"
                min="1800"
                placeholder="e.g., 2018"
                type="number"
                {...register("vintageYear")}
              />
              {errors.vintageYear && (
                <p className="mt-1 text-xs text-destructive">{errors.vintageYear.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="region">
                Region <span className="text-destructive">*</span>
              </Label>
              <Input id="region" placeholder="e.g., Bordeaux, France" {...register("region")} />
              {errors.region && (
                <p className="mt-1 text-xs text-destructive">{errors.region.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Additional Details</h2>

          <div>
            <Label htmlFor="composition">
              Composition <span className="text-destructive">*</span>
            </Label>
            <Input
              id="composition"
              placeholder="e.g., Cabernet Sauvignon, Merlot, Cabernet Franc"
              {...register("composition")}
            />
            {errors.composition && (
              <p className="mt-1 text-xs text-destructive">{errors.composition.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="attribution">
              Attribution <span className="text-destructive">*</span>
            </Label>
            <Input
              id="attribution"
              placeholder="e.g., Producer or vineyard name"
              {...register("attribution")}
            />
            {errors.attribution && (
              <p className="mt-1 text-xs text-destructive">{errors.attribution.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="quantity">Quantity in Stock</Label>
            <Input
              id="quantity"
              min="0"
              placeholder="e.g., 100"
              type="number"
              {...register("quantity")}
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-destructive">{errors.quantity.message}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button className="flex-1" disabled={isSubmitting || mutation.isPending} type="submit">
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            className="flex-1"
            onClick={() => navigate({ to: `/wines/${id}` })}
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
