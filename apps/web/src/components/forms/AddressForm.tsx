import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { DeliveryMethodToggle } from "@/routes/-components/cart/DeliveryMethodToggle";

const requiredString = (label: string) => z.string().min(1, `${label} is required`);

const baseAddressFormSchema = z.object({
  billingAddressSameAsShipping: z.boolean(),
  city: requiredString("City"),
  country: requiredString("Country"),
  deliveryType: z.enum(["pickup", "shipping"]),
  guestEmail: z.string().optional().or(z.literal("")),
  guestName: z.string().optional().or(z.literal("")),
  houseNumber: requiredString("House number"),
  paymentMethod: z.enum(["card", "bank_transfer", "cash_on_delivery"]),
  postalCode: requiredString("Postal code"),
  street: requiredString("Street"),

  billingCity: z.string().optional().default(""),
  billingCountry: z.string().optional().default(""),
  billingHouseNumber: z.string().optional().default(""),
  billingPostalCode: z.string().optional().default(""),
  billingStreet: z.string().optional().default(""),
});

export type AddressFormValues = z.infer<typeof baseAddressFormSchema>;

function buildSchema(showGuestFields: boolean) {
  return baseAddressFormSchema.superRefine((data, ctx) => {
    if (!data.billingAddressSameAsShipping) {
      const billing = [
        { field: "billingStreet" as const, label: "Street" },
        { field: "billingHouseNumber" as const, label: "House number" },
        { field: "billingCity" as const, label: "City" },
        { field: "billingPostalCode" as const, label: "Postal code" },
        { field: "billingCountry" as const, label: "Country" },
      ];
      for (const { field, label } of billing) {
        if (!data[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${label} is required`,
          });
        }
      }
    }

    if (showGuestFields) {
      if (!data.guestName || data.guestName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["guestName"],
          message: "Name is required",
        });
      }
      if (!data.guestEmail || data.guestEmail.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["guestEmail"],
          message: "Email is required",
        });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.guestEmail)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["guestEmail"],
          message: "Invalid email",
        });
      }
    }
  });
}

export type SavedAddress = {
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
};

export interface AddressFormHandle {
  submit: () => void;
}

export interface AddressFormProps {
  defaultValues: Partial<AddressFormValues>;
  isSubmitting: boolean;
  onSubmit: SubmitHandler<AddressFormValues>;
  showGuestFields: boolean;
  onDeliveryTypeChange?: (value: "pickup" | "shipping") => void;
  savedShipping?: SavedAddress | null;
  savedBilling?: SavedAddress | null;
}

const SHIPPING_FIELDS = [
  "street",
  "houseNumber",
  "city",
  "postalCode",
  "country",
] as const satisfies ReadonlyArray<keyof AddressFormValues>;

const BILLING_FIELDS = [
  "billingStreet",
  "billingHouseNumber",
  "billingCity",
  "billingPostalCode",
  "billingCountry",
] as const satisfies ReadonlyArray<keyof AddressFormValues>;

export const AddressForm = forwardRef<AddressFormHandle, AddressFormProps>(function AddressForm(
  {
    defaultValues,
    onSubmit,
    showGuestFields,
    onDeliveryTypeChange,
    savedShipping,
    savedBilling,
  },
  ref
) {
  const schema = useMemo(() => buildSchema(showGuestFields), [showGuestFields]);
  const formElRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitted },
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
      billingCity: "",
      billingCountry: "",
      billingHouseNumber: "",
      billingPostalCode: "",
      billingStreet: "",
      ...defaultValues,
    },
    resolver: zodResolver(schema as never),
  });

  useImperativeHandle(
    ref,
    () => ({
      submit: () => {
        void handleSubmit(onSubmit)();
      },
    }),
    [handleSubmit, onSubmit]
  );

  const deliveryType = watch("deliveryType");
  const paymentMethod = watch("paymentMethod");
  const billingSameAsShipping = watch("billingAddressSameAsShipping");
  const errorCount = Object.keys(errors).length;
  const showErrorBanner = errorCount > 0 && isSubmitted;

  const applySavedAddress = (
    saved: SavedAddress,
    fields: typeof SHIPPING_FIELDS | typeof BILLING_FIELDS,
    prefix: "" | "billing"
  ) => {
    const map = {
      street: saved.street,
      houseNumber: saved.houseNumber,
      city: saved.city,
      postalCode: saved.postalCode,
      country: saved.country,
    } as const;
    for (const field of fields) {
      const baseKey = (prefix
        ? (field.replace(prefix, "").charAt(0).toLowerCase() +
            field.replace(prefix, "").slice(1))
        : field) as keyof typeof map;
      setValue(field, map[baseKey], { shouldDirty: true, shouldValidate: true });
    }
  };

  const addressSectionTitle = deliveryType === "pickup" ? "Contact Address" : "Shipping Address";

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} ref={formElRef}>
      {showErrorBanner && (
        <div
          aria-live="polite"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {errorCount === 1
            ? "Please fix the error below before confirming your order."
            : `Please fix the ${errorCount} errors below before confirming your order.`}
        </div>
      )}

      {showGuestFields && (
        <div className="space-y-4 rounded-md border border-border p-4">
          <p className="text-sm font-medium">Guest Information</p>
          <div>
            <Label htmlFor="guestName">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input id="guestName" {...register("guestName")} placeholder="John Doe" />
            {errors.guestName && (
              <p className="mt-1 text-xs text-destructive">{errors.guestName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="guestEmail">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guestEmail"
              type="email"
              {...register("guestEmail")}
              placeholder="john@example.com"
            />
            {errors.guestEmail && (
              <p className="mt-1 text-xs text-destructive">{errors.guestEmail.message}</p>
            )}
          </div>
        </div>
      )}

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

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">{addressSectionTitle}</p>
          {savedShipping && (
            <Button
              onClick={() => applySavedAddress(savedShipping, SHIPPING_FIELDS, "")}
              size="sm"
              type="button"
              variant="outline"
            >
              Use saved address
            </Button>
          )}
        </div>
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
            {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city.message}</p>}
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

      <div className="flex items-center gap-2">
        <Checkbox
          checked={billingSameAsShipping}
          id="billingAddressSameAsShipping"
          onCheckedChange={(checked) => setValue("billingAddressSameAsShipping", checked === true)}
        />
        <Label htmlFor="billingAddressSameAsShipping">
          Billing address is the same as {deliveryType === "pickup" ? "contact" : "shipping"}{" "}
          address
        </Label>
      </div>

      {!billingSameAsShipping && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Billing Address</p>
            {savedBilling && (
              <Button
                onClick={() => applySavedAddress(savedBilling, BILLING_FIELDS, "billing")}
                size="sm"
                type="button"
                variant="outline"
              >
                Use saved address
              </Button>
            )}
          </div>
          <div>
            <Label htmlFor="billingCountry">Country</Label>
            <Input
              id="billingCountry"
              {...register("billingCountry")}
              placeholder="Czech Republic"
            />
            {errors.billingCountry && (
              <p className="mt-1 text-xs text-destructive">{errors.billingCountry.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="billingCity">City</Label>
              <Input id="billingCity" {...register("billingCity")} placeholder="Brno" />
              {errors.billingCity && (
                <p className="mt-1 text-xs text-destructive">{errors.billingCity.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="billingPostalCode">Postal Code</Label>
              <Input
                id="billingPostalCode"
                {...register("billingPostalCode")}
                placeholder="602 00"
              />
              {errors.billingPostalCode && (
                <p className="mt-1 text-xs text-destructive">{errors.billingPostalCode.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="billingStreet">Street</Label>
              <Input id="billingStreet" {...register("billingStreet")} placeholder="Botanická" />
              {errors.billingStreet && (
                <p className="mt-1 text-xs text-destructive">{errors.billingStreet.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="billingHouseNumber">House No.</Label>
              <Input
                id="billingHouseNumber"
                {...register("billingHouseNumber")}
                placeholder="68A"
              />
              {errors.billingHouseNumber && (
                <p className="mt-1 text-xs text-destructive">{errors.billingHouseNumber.message}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </form>
  );
});
