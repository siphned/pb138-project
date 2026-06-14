import { useMemo, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { TextareaField } from "@/components/forms/TextareaField";
import { TextField } from "@/components/forms/TextField";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const wineFormSchema = z.object({
  alcoholContent: z.string().regex(/^\d{1,2}(\.\d{1,2})?$/, { message: "Use a number like 12.5" }),
  attribution: z
    .string()
    .refine((v) => v.trim().length > 0, { message: "Attribution is required" }),
  color: z.enum(["red", "white", "rosé", "orange", "gray", "tawny", "yellow"]),
  composition: z
    .string()
    .refine((v) => v.trim().length > 0, { message: "Composition is required" }),
  description: z
    .string()
    .refine((v) => v.trim().length > 0, { message: "Description is required" }),
  name: z.string().refine((v) => v.trim().length > 0, { message: "Name is required" }),
  quantity: z.coerce.number().int().min(0, { message: "Quantity cannot be negative" }),
  region: z.string().refine((v) => v.trim().length > 0, { message: "Region is required" }),
  type: z.enum(["still", "sparkling", "fortified", "dessert"]),
  vintageYear: z.coerce
    .number()
    .int()
    .min(1800, { message: "Year must be 1800 or later" })
    .max(2100, { message: "Year must be 2100 or earlier" }),
  volumeMl: z.coerce.number().int().min(1, { message: "Volume must be at least 1 ml" }),
});

export type WineFormValues = z.infer<typeof wineFormSchema>;

interface WineFormProps {
  defaultValues: Partial<WineFormValues>;
  onSubmit: (values: WineFormValues, images: File[]) => void;
  isPending: boolean;
  submitLabel: string;
  /** When true, render an optional image picker that bubbles files up via onSubmit. */
  showImageUpload?: boolean;
  /** When true, hide the Attribution field — caller has pre-filled it via defaultValues. */
  hideAttribution?: boolean;
}

export function WineForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
  showImageUpload = false,
  hideAttribution = false,
}: WineFormProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const resolver = useMemo<Resolver<WineFormValues>>(
    () => async (values) => {
      const result = wineFormSchema.safeParse(values);
      if (result.success) return { errors: {}, values: result.data };
      const errors: Record<string, { type: string; message: string }> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string;
        if (path && !errors[path]) errors[path] = { message: issue.message, type: "manual" };
      }
      return { errors: errors as never, values: {} };
    },
    []
  );

  const form = useForm<WineFormValues>({
    defaultValues: {
      alcoholContent: "12.5",
      attribution: "",
      color: "red",
      composition: "",
      description: "",
      name: "",
      quantity: 0,
      region: "",
      type: "still",
      vintageYear: new Date().getFullYear() - 1,
      volumeMl: 750,
      ...defaultValues,
    },
    mode: "onSubmit",
    resolver,
    reValidateMode: "onChange",
  });

  const handleFormSubmit = (values: WineFormValues) => {
    if (imageError) return;
    onSubmit(values, imageFiles);
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleFormSubmit)}>
        <TextField control={form.control} label="Wine name" name="name" placeholder="Pálava 2024" />

        <TextareaField control={form.control} label="Description" name="description" rows={3} />

        {!hideAttribution && (
          <TextField
            control={form.control}
            description="The producer / vineyard name on the label."
            label="Attribution"
            name="attribution"
            placeholder="Vinařství Lechovice"
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="still">Still</SelectItem>
                    <SelectItem value="sparkling">Sparkling</SelectItem>
                    <SelectItem value="fortified">Fortified</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField control={form.control} label="Region" name="region" placeholder="Moravia" />
          <TextField
            control={form.control}
            label="Composition"
            name="composition"
            placeholder="Pálava 100%"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <TextField control={form.control} label="Vintage year" name="vintageYear" type="number" />
          <TextField
            control={form.control}
            label="Alcohol %"
            name="alcoholContent"
            placeholder="12.5"
          />
          <TextField
            control={form.control}
            label="Volume (ml)"
            min="1"
            name="volumeMl"
            type="number"
          />
        </div>

        <TextField
          control={form.control}
          description="Bottles available for retail allocation."
          label="Initial stock"
          min="0"
          name="quantity"
          type="number"
        />

        {showImageUpload && (
          <ImageUploadField
            description="PNG, JPEG, WebP, or AVIF up to 10 MB each. Uploaded after the wine is created."
            onErrorChange={setImageError}
            onFilesChange={setImageFiles}
          />
        )}

        <SubmitButton disabled={!!imageError} isPending={isPending}>
          {submitLabel}
        </SubmitButton>
      </form>
    </Form>
  );
}
