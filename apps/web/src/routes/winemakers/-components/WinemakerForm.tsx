import { useMemo } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@/components/ui/form";
import { AddressFields } from "@/routes/-components/AddressFields";
import { SubmitButton } from "@/routes/-components/SubmitButton";
import { TextareaField } from "@/routes/-components/TextareaField";
import { TextField } from "@/routes/-components/TextField";

const winemakerFormSchema = z.object({
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

export type WinemakerFormValues = z.infer<typeof winemakerFormSchema>;

interface WinemakerFormProps {
  defaultValues: Partial<WinemakerFormValues>;
  onSubmit: (data: WinemakerFormValues) => void;
  isPending: boolean;
  submitLabel: string;
}

export function WinemakerForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
}: WinemakerFormProps) {
  const resolver = useMemo<Resolver<WinemakerFormValues>>(
    () => async (values) => {
      const result = winemakerFormSchema.safeParse(values);
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

  const form = useForm<WinemakerFormValues>({
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
    resolver,
    reValidateMode: "onChange",
  });

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <TextField
          control={form.control}
          label="Winemaker / vineyard name"
          name="name"
          placeholder="e.g., Vinařství Lechovice"
        />

        <TextareaField
          control={form.control}
          description="Tell customers about your vineyard, wines, and story."
          label="Description"
          name="description"
          placeholder="Describe your winery."
        />

        <AddressFields control={form.control} title="Winery address" />

        <SubmitButton isPending={isPending}>{submitLabel}</SubmitButton>
      </form>
    </Form>
  );
}
