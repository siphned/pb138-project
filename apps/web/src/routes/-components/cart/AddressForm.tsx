import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
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
import { DeliveryMethodToggle } from "./DeliveryMethodToggle";

export const addressFormSchema = z.object({
  billingAddressSameAsShipping: z.boolean(),
  city: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
  deliveryType: z.enum(["pickup", "shipping"]),
  guestEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  guestName: z.string().optional(),
  houseNumber: z.string().min(1, "Required"),
  paymentMethod: z.enum(["card", "bank_transfer", "cash_on_delivery"]),
  postalCode: z.string().min(1, "Required"),
  street: z.string().min(1, "Required"),
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;

type AddressFormProps = {
  defaultValues?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues) => void;
  isSubmitting: boolean;
  showGuestFields?: boolean;
  onDeliveryTypeChange?: (type: "pickup" | "shipping") => void;
};

export const AddressForm = forwardRef<HTMLFormElement, AddressFormProps>(
  ({ defaultValues, onSubmit, isSubmitting, showGuestFields, onDeliveryTypeChange }, ref) => {
    const form = useForm<AddressFormValues>({
      defaultValues: {
        billingAddressSameAsShipping: true,
        city: "",
        country: "",
        deliveryType: "shipping",
        guestEmail: "",
        guestName: "",
        houseNumber: "",
        paymentMethod: "card",
        postalCode: "",
        street: "",
        ...defaultValues,
      },
      // TODO: drop `as any` once `bun install` actually deduplicates zod to 4.4.3
      // per package.json `overrides`. Currently 4.4.1 + 4.4.3 coexist in node_modules.
      // biome-ignore lint/suspicious/noExplicitAny: zod version skew (see TODO above)
      resolver: zodResolver(addressFormSchema as any),
    });

    return (
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} ref={ref}>
          {/* Guest Fields */}
          {showGuestFields && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Guest Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guestName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Full Name" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guestEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Email Address"
                          type="email"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Delivery Method */}
          <FormField
            control={form.control}
            name="deliveryType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Method</FormLabel>
                <FormControl>
                  <DeliveryMethodToggle
                    onChange={(val) => {
                      field.onChange(val);
                      onDeliveryTypeChange?.(val);
                    }}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Shipping Address</h4>

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Country" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="City" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Postal Code" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Street" {...field} disabled={isSubmitting} />
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
                    <FormControl>
                      <Input placeholder="House No." {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Payment Method */}
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select
                  defaultValue={field.value}
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                >
                  <FormControl className="w-50">
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="card">Card payment</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Billing same as shipping */}
          <FormField
            control={form.control}
            name="billingAddressSameAsShipping"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    disabled={isSubmitting}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Billing address is the same as shipping</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    );
  }
);

AddressForm.displayName = "AddressForm";
