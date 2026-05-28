import { useMemo } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";

const shopFormSchema = z.object({
  name: z.string().refine((v) => v.trim().length > 0, { message: "Name is required" }),
  description: z.string().refine((v) => v.trim().length > 0, {
    message: "Description is required",
  }),
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

export type ShopFormValues = z.infer<typeof shopFormSchema>;

interface ShopFormProps {
  defaultValues: Partial<ShopFormValues>;
  onSubmit: (data: ShopFormValues) => void;
  isPending: boolean;
  submitLabel: string;
}

export function ShopForm({ defaultValues, onSubmit, isPending, submitLabel }: ShopFormProps) {
  const resolver = useMemo<Resolver<ShopFormValues>>(
    () => async (values) => {
      const result = shopFormSchema.safeParse(values);
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
    reValidateMode: "onChange",
    resolver,
  });

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Vinotéka Brno" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell customers about your shop."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>What kind of wines do you sell? Atmosphere? Hours?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 rounded-md border border-border p-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Shop address
          </h3>
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
        </div>

        <Button className="w-full" disabled={isPending} type="submit">
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
