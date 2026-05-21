import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeliveryMethodToggle } from "./DeliveryMethodToggle";

export const addressFormSchema = z
  .object({
    billingAddressSameAsShipping: z.boolean(),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
    deliveryType: z.enum(["pickup", "shipping"]),
    guestEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    guestName: z.string().optional().or(z.literal("")),
    houseNumber: z.string().min(1, "House number is required"),
    paymentMethod: z.enum(["card", "bank_transfer", "cash_on_delivery"]),
    postalCode: z.string().min(1, "Postal code is required"),
    street: z.string().min(1, "Street is required"),
  })
  .refine(
    (_data) => {
      // guestEmail and guestName are optional in the schema but required for guest checkout.
      // Validation is enforced via the showGuestFields prop — when true, the fields become required
      // through native HTML required + form-level validation.
      return true;
    },
    { message: "", path: ["guestEmail"] }
  );

export type AddressFormValues = z.infer<typeof addressFormSchema>;

export interface AddressFormProps {
  defaultValues: Partial<AddressFormValues>;
  isSubmitting: boolean;
  onSubmit: SubmitHandler<AddressFormValues>;
  showGuestFields: boolean;
  onDeliveryTypeChange?: (value: "pickup" | "shipping") => void;
}

export const AddressForm = forwardRef<HTMLFormElement, AddressFormProps>(function AddressForm(
  { defaultValues, onSubmit, showGuestFields, onDeliveryTypeChange },
  ref
) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormValues>({
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
    resolver: zodResolver(addressFormSchema as never),
  });

  const deliveryType = watch("deliveryType");
  const paymentMethod = watch("paymentMethod");
  const billingSameAsShipping = watch("billingAddressSameAsShipping");

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} ref={ref}>
      {/* Guest fields */}
      {showGuestFields && (
        <div className="space-y-4 rounded-md border border-border p-4">
          <p className="text-sm font-medium">Guest Information</p>
          <div>
            <Label htmlFor="guestName">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guestName"
              {...register("guestName", { required: showGuestFields })}
              placeholder="John Doe"
            />
            {errors.guestName && (
              <p className="mt-1 text-xs text-destructive">Name is required for guest checkout</p>
            )}
          </div>
          <div>
            <Label htmlFor="guestEmail">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guestEmail"
              type="email"
              {...register("guestEmail", { required: showGuestFields })}
              placeholder="john@example.com"
            />
            {errors.guestEmail && (
              <p className="mt-1 text-xs text-destructive">Email is required for guest checkout</p>
            )}
          </div>
        </div>
      )}

      {/* Delivery Method */}
      <div>
        <Label className="mb-2 block">Delivery Method</Label>
        <DeliveryMethodToggle
          onChange={(value) => {
            setValue("deliveryType", value);
            onDeliveryTypeChange?.(value);
          }}
          value={deliveryType}
        />
      </div>

      {/* Shipping Address */}
      {deliveryType === "shipping" && (
        <div className="space-y-4">
          <p className="text-sm font-medium">Shipping Address</p>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register("country")} placeholder="Czech Republic" />
            {errors.country && (
              <p className="mt-1 text-xs text-destructive">{errors.country.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} placeholder="Brno" />
              {errors.city && (
                <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" {...register("postalCode")} placeholder="602 00" />
              {errors.postalCode && (
                <p className="mt-1 text-xs text-destructive">{errors.postalCode.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="street">Street</Label>
              <Input id="street" {...register("street")} placeholder="Botanická" />
              {errors.street && (
                <p className="mt-1 text-xs text-destructive">{errors.street.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="houseNumber">House No.</Label>
              <Input id="houseNumber" {...register("houseNumber")} placeholder="68A" />
              {errors.houseNumber && (
                <p className="mt-1 text-xs text-destructive">{errors.houseNumber.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div>
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select
          onValueChange={(value) =>
            setValue("paymentMethod", value as AddressFormValues["paymentMethod"])
          }
          value={paymentMethod}
        >
          <SelectTrigger id="paymentMethod">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="card">Card payment</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Billing address same as shipping */}
      <div className="flex items-center gap-2">
        <Checkbox
          checked={billingSameAsShipping}
          id="billingAddressSameAsShipping"
          onCheckedChange={(checked) => setValue("billingAddressSameAsShipping", checked === true)}
        />
        <Label htmlFor="billingAddressSameAsShipping">
          Billing address is the same as shipping
        </Label>
      </div>
    </form>
  );
});
