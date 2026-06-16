import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
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
  city: z.string().refine((v) => v.trim().length > 0, { message: "City is required" }),
  country: z.string().refine((v) => v.trim().length > 0, { message: "Country is required" }),
  houseNumber: z
    .string()
    .refine((v) => v.trim().length > 0, { message: "House number is required" }),
  postalCode: z.string().refine((v) => v.trim().length > 0, { message: "Postal code is required" }),
  street: z.string().refine((v) => v.trim().length > 0, { message: "Street is required" }),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface SettingsAddressFormProps {
  type: "shipping" | "billing";
  defaultValues: Partial<AddressFormValues>;
  onSaved?: () => void;
}

export function SettingsAddressForm({ type, defaultValues, onSaved }: SettingsAddressFormProps) {
  const mutation = usePostUsersMeAddresses();

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
    resolver: standardSchemaResolver(addressSchema) as Resolver<AddressFormValues>,
    reValidateMode: "onChange",
  });

  const onSubmit = (values: AddressFormValues) => {
    mutation.mutate({ data: { ...values, type } }, { onSuccess: () => onSaved?.() });
  };

  const idleLabel = type === "shipping" ? "Save shipping address" : "Save billing address";

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
            {mutation.isPending ? "Saving…" : idleLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
