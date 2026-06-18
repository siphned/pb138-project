import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@/components/ui/form";
import { AddressFields } from "@/routes/-components/AddressFields";
import { addressSchemaShape, requiredString } from "@/routes/-components/address-schema";
import { ImageUploadField } from "@/routes/-components/ImageUploadField";
import { SubmitButton } from "@/routes/-components/SubmitButton";
import { TextareaField } from "@/routes/-components/TextareaField";
import { TextField } from "@/routes/-components/TextField";

const shopFormSchema = z.object({
  ...addressSchemaShape,
  description: requiredString("Description"),
  name: requiredString("Name"),
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
