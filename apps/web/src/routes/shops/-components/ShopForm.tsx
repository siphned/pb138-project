import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@/components/ui/form";
import { AddressFields } from "@/routes/-components/AddressFields";
import { ImageUploadField } from "@/routes/-components/ImageUploadField";
import { SubmitButton } from "@/routes/-components/SubmitButton";
import { TextareaField } from "@/routes/-components/TextareaField";
import { TextField } from "@/routes/-components/TextField";

const shopFormSchema = z.object({
  city: z.string().refine((v) => v.trim().length > 0, { message: "City is required" }),
  country: z.string().refine((v) => v.trim().length > 0, { message: "Country is required" }),
  description: z.string().refine((v) => v.trim().length > 0, {
    message: "Description is required",
  }),
  houseNumber: z
    .string()
    .refine((v) => v.trim().length > 0, { message: "House number is required" }),
  name: z.string().refine((v) => v.trim().length > 0, { message: "Name is required" }),
  postalCode: z.string().refine((v) => v.trim().length > 0, { message: "Postal code is required" }),
  street: z.string().refine((v) => v.trim().length > 0, { message: "Street is required" }),
});

export type ShopFormValues = z.infer<typeof shopFormSchema>;

interface ShopFormProps {
  defaultValues: Partial<ShopFormValues>;
  onSubmit: (data: ShopFormValues, images: File[]) => void;
  isPending: boolean;
  submitLabel: string;
  /** When true, render an optional image picker that bubbles files up via onSubmit. */
  showImageUpload?: boolean;
}

export function ShopForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
  showImageUpload = false,
}: ShopFormProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const form = useForm<ShopFormValues>({
    defaultValues: {
      city: "",
      country: "",
      description: "",
      houseNumber: "",
      name: "",
      postalCode: "",
      street: "",
      ...defaultValues,
    },
    mode: "onSubmit",
    resolver: standardSchemaResolver(shopFormSchema) as Resolver<ShopFormValues>,
    reValidateMode: "onChange",
  });

  const handleFormSubmit = (values: ShopFormValues) => {
    if (imageError) return;
    onSubmit(values, imageFiles);
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleFormSubmit)}>
        <TextField
          control={form.control}
          label="Shop name"
          name="name"
          placeholder="e.g., Vinotéka Brno"
        />

        <TextareaField
          control={form.control}
          description="What kind of wines do you sell? Atmosphere? Hours?"
          label="Description"
          name="description"
          placeholder="Tell customers about your shop."
        />

        <AddressFields control={form.control} title="Shop address" />

        {showImageUpload && (
          <ImageUploadField
            description="PNG, JPEG, WebP, or AVIF up to 10 MB each. Uploaded after the shop is created."
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
