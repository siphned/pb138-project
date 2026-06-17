import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { type ReactNode, useMemo } from "react";
import {
  type Resolver,
  type SubmitHandler,
  type UseFormRegister,
  type UseFormReturn,
  useForm,
} from "react-hook-form";
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

const POSTAL_CODE_REGEX = /^[\d\s-]{3,10}$/;
const COUNTRY_REGEX = /^[\p{L}\s'-]+$/u;
const HOUSE_NUMBER_REGEX = /^\d+[a-zA-Z]?(\/\d+)?$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const POSTAL_CODE_MESSAGE = "Postal code must be 3-10 digits (e.g., 60200 or 602 00)";
const COUNTRY_MESSAGE = "Country must contain only letters";
const HOUSE_NUMBER_MESSAGE = "House number must be digits, optionally with one letter (e.g., 68A)";

const baseAddressFormSchema = z.object({
  billingAddressSameAsShipping: z.boolean(),

  billingCity: z.string().optional().default(""),
  billingCountry: z.string().optional().default(""),
  billingHouseNumber: z.string().optional().default(""),
  billingPostalCode: z.string().optional().default(""),
  billingStreet: z.string().optional().default(""),
  city: requiredString("City"),
  country: requiredString("Country").regex(COUNTRY_REGEX, COUNTRY_MESSAGE),
  deliveryType: z.enum(["pickup", "shipping"]),
  guestEmail: z.string().optional().or(z.literal("")),
  guestName: z.string().optional().or(z.literal("")),
  houseNumber: requiredString("House number").regex(HOUSE_NUMBER_REGEX, HOUSE_NUMBER_MESSAGE),
  paymentMethod: z.enum(["card", "bank_transfer", "cash_on_delivery"]),
  postalCode: requiredString("Postal code").regex(POSTAL_CODE_REGEX, POSTAL_CODE_MESSAGE),
  street: requiredString("Street"),
});

export type AddressFormValues = z.infer<typeof baseAddressFormSchema>;

type RefineCtx = z.RefinementCtx;

const BILLING_REQUIRED_FIELDS = [
  { field: "billingStreet" as const, label: "Street" },
  { field: "billingHouseNumber" as const, label: "House number" },
  { field: "billingCity" as const, label: "City" },
  { field: "billingPostalCode" as const, label: "Postal code" },
  { field: "billingCountry" as const, label: "Country" },
];

function addIssue(ctx: RefineCtx, path: keyof AddressFormValues, message: string) {
  ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [path] });
}

function validateBillingFields(data: AddressFormValues, ctx: RefineCtx) {
  for (const { field, label } of BILLING_REQUIRED_FIELDS) {
    if (!data[field]) addIssue(ctx, field, `${label} is required`);
  }
  if (data.billingCountry && !COUNTRY_REGEX.test(data.billingCountry)) {
    addIssue(ctx, "billingCountry", COUNTRY_MESSAGE);
  }
  if (data.billingPostalCode && !POSTAL_CODE_REGEX.test(data.billingPostalCode)) {
    addIssue(ctx, "billingPostalCode", POSTAL_CODE_MESSAGE);
  }
  if (data.billingHouseNumber && !HOUSE_NUMBER_REGEX.test(data.billingHouseNumber)) {
    addIssue(ctx, "billingHouseNumber", HOUSE_NUMBER_MESSAGE);
  }
}

function validateGuestFields(data: AddressFormValues, ctx: RefineCtx) {
  const name = data.guestName?.trim() ?? "";
  if (!name) addIssue(ctx, "guestName", "Name is required");

  const email = data.guestEmail?.trim() ?? "";
  if (!email) {
    addIssue(ctx, "guestEmail", "Email is required");
  } else if (!EMAIL_REGEX.test(email)) {
    addIssue(ctx, "guestEmail", "Invalid email");
  }
}

function buildSchema(showGuestFields: boolean) {
  return baseAddressFormSchema.superRefine((data, ctx) => {
    if (!data.billingAddressSameAsShipping) validateBillingFields(data, ctx);
    if (showGuestFields) validateGuestFields(data, ctx);
  });
}

export type SavedAddress = {
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
};

export interface AddressFormProps {
  defaultValues: Partial<AddressFormValues>;
  isSubmitting: boolean;
  onSubmit: SubmitHandler<AddressFormValues>;
  showGuestFields: boolean;
  onDeliveryTypeChange?: (value: "pickup" | "shipping") => void;
  savedShipping?: SavedAddress | null;
  savedBilling?: SavedAddress | null;
  footer?: ReactNode;
}

type AddressFieldKey = "street" | "houseNumber" | "city" | "postalCode" | "country";

type AddressFieldGroupKeys = {
  street: keyof AddressFormValues;
  houseNumber: keyof AddressFormValues;
  city: keyof AddressFormValues;
  postalCode: keyof AddressFormValues;
  country: keyof AddressFormValues;
};

const SHIPPING_KEYS: AddressFieldGroupKeys = {
  city: "city",
  country: "country",
  houseNumber: "houseNumber",
  postalCode: "postalCode",
  street: "street",
};

const BILLING_KEYS: AddressFieldGroupKeys = {
  city: "billingCity",
  country: "billingCountry",
  houseNumber: "billingHouseNumber",
  postalCode: "billingPostalCode",
  street: "billingStreet",
};


type FormErrors = UseFormReturn<AddressFormValues>["formState"]["errors"];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

function AddressFields({
  keys,
  register,
  errors,
}: {
  keys: AddressFieldGroupKeys;
  register: UseFormRegister<AddressFormValues>;
  errors: FormErrors;
}) {
  const errFor = (k: AddressFieldKey) => errors[keys[k]]?.message as string | undefined;
  return (
    <>
      <div>
        <Label htmlFor={keys.country}>Country</Label>
        <Input id={keys.country} {...register(keys.country)} placeholder="Czech Republic" />
        <FieldError message={errFor("country")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={keys.city}>City</Label>
          <Input id={keys.city} {...register(keys.city)} placeholder="Brno" />
          <FieldError message={errFor("city")} />
        </div>
        <div>
          <Label htmlFor={keys.postalCode}>Postal Code</Label>
          <Input id={keys.postalCode} {...register(keys.postalCode)} placeholder="602 00" />
          <FieldError message={errFor("postalCode")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={keys.street}>Street</Label>
          <Input id={keys.street} {...register(keys.street)} placeholder="Botanická" />
          <FieldError message={errFor("street")} />
        </div>
        <div>
          <Label htmlFor={keys.houseNumber}>House No.</Label>
          <Input id={keys.houseNumber} {...register(keys.houseNumber)} placeholder="68A" />
          <FieldError message={errFor("houseNumber")} />
        </div>
      </div>
    </>
  );
}

function GuestFields({
  register,
  errors,
}: {
  register: UseFormRegister<AddressFormValues>;
  errors: FormErrors;
}) {
  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <p className="text-sm font-medium">Guest Information</p>
      <div>
        <Label htmlFor="guestName">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input id="guestName" {...register("guestName")} placeholder="John Doe" />
        <FieldError message={errors.guestName?.message as string | undefined} />
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
        <FieldError message={errors.guestEmail?.message as string | undefined} />
      </div>
    </div>
  );
}

function SectionHeader({ title, onUseSaved }: { title: string; onUseSaved?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm font-medium">{title}</p>
      {onUseSaved && (
        <Button onClick={onUseSaved} size="sm" type="button" variant="outline">
          Use saved address
        </Button>
      )}
    </div>
  );
}

function ErrorBanner({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div
      aria-live="polite"
      className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {count === 1
        ? "Please fix the error below before confirming your order."
        : `Please fix the ${count} errors below before confirming your order.`}
    </div>
  );
}

export function AddressForm({
  defaultValues,
  onSubmit,
  showGuestFields,
  onDeliveryTypeChange,
  savedShipping,
  savedBilling,
  footer,
}: AddressFormProps) {
  const schema = useMemo(() => buildSchema(showGuestFields), [showGuestFields]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormValues>({
    defaultValues: {
      billingAddressSameAsShipping: true,
      billingCity: "",
      billingCountry: "",
      billingHouseNumber: "",
      billingPostalCode: "",
      billingStreet: "",
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
    resolver,
  });

  const deliveryType = watch("deliveryType");
  const paymentMethod = watch("paymentMethod");
  const billingSameAsShipping = watch("billingAddressSameAsShipping");
  const errorCount = Object.keys(errors).length;

  const applySavedAddress = (saved: SavedAddress, keys: AddressFieldGroupKeys) => {
    setValue(keys.street, saved.street, { shouldDirty: true, shouldValidate: true });
    setValue(keys.houseNumber, saved.houseNumber, { shouldDirty: true, shouldValidate: true });
    setValue(keys.city, saved.city, { shouldDirty: true, shouldValidate: true });
    setValue(keys.postalCode, saved.postalCode, { shouldDirty: true, shouldValidate: true });
    setValue(keys.country, saved.country, { shouldDirty: true, shouldValidate: true });
  };

  const addressTitle = deliveryType === "pickup" ? "Contact Address" : "Shipping Address";
  const billingSameLabel = deliveryType === "pickup" ? "contact" : "shipping";

  return (
    <form className="space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
      <ErrorBanner count={errorCount} />

      {showGuestFields && <GuestFields errors={errors} register={register} />}

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
        <SectionHeader
          onUseSaved={
            savedShipping ? () => applySavedAddress(savedShipping, SHIPPING_KEYS) : undefined
          }
          title={addressTitle}
        />
        <AddressFields errors={errors} keys={SHIPPING_KEYS} register={register} />
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
          Billing address is the same as {billingSameLabel} address
        </Label>
      </div>

      {!billingSameAsShipping && (
        <div className="space-y-4">
          <SectionHeader
            onUseSaved={
              savedBilling ? () => applySavedAddress(savedBilling, BILLING_KEYS) : undefined
            }
            title="Billing Address"
          />
          <AddressFields errors={errors} keys={BILLING_KEYS} register={register} />
        </div>
      )}

      {footer}
    </form>
  );
}
