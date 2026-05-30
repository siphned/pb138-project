import { useMemo } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { usePostUsersMeAddresses } from "@/generated/hooks/usePostUsersMeAddresses";

const addressSchema = z.object({
  street: z.string().refine((v) => v.trim().length > 0, { message: "Street is required" }),
  houseNumber: z
    .string()
    .refine((v) => v.trim().length > 0, { message: "House number is required" }),
  city: z.string().refine((v) => v.trim().length > 0, { message: "City is required" }),
  postalCode: z
    .string()
    .refine((v) => v.trim().length > 0, { message: "Postal code is required" }),
  country: z.string().refine((v) => v.trim().length > 0, { message: "Country is required" }),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface SettingsAddressFormProps {
  type: "shipping" | "billing";
  defaultValues: Partial<AddressFormValues>;
  onSaved?: () => void;
}

export function SettingsAddressForm({
  type,
  defaultValues,
  onSaved,
}: SettingsAddressFormProps) {
  const mutation = usePostUsersMeAddresses();

  const resolver = useMemo<Resolver<AddressFormValues>>(
    () => async (values) => {
      const result = addressSchema.safeParse(values);
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

  const form = useForm<AddressFormValues>({
    defaultValues: {
      city: "",
      country: "",
      houseNumber: "",
      postalCode: "",
      street: "",
      ...defaultValues,
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver,
  });

  const onSubmit = (values: AddressFormValues) => {
    mutation.mutate(
      { data: { ...values, type } },
      { onSuccess: () => onSaved?.() }
    );
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street</FormLabel>
                <FormControl>
                  <Input placeholder="Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="houseNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>House no.</FormLabel>
                <FormControl>
                  <Input className="w-24" placeholder="12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal code</FormLabel>
                <FormControl>
                  <Input className="w-32" placeholder="60200" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Brno" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder="Czech Republic" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
          {mutation.isSuccess && !mutation.isPending && (
            <p className="text-xs text-muted-foreground">Saved.</p>
          )}
          <Button className="ml-auto" disabled={mutation.isPending} type="submit">
            {mutation.isPending
              ? "Saving…"
              : type === "shipping"
                ? "Save shipping address"
                : "Save billing address"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
