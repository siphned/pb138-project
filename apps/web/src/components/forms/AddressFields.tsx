import type { Control, FieldValues } from "react-hook-form";
import { FormSection } from "./FormSection";
import { TextField } from "./TextField";

/**
 * Address fields shared by ShopForm and EventForm. Expects the parent form to
 * include `street`, `houseNumber`, `postalCode`, `city`, and `country` keys.
 */
interface AddressFieldsProps<TForm extends FieldValues> {
  control: Control<TForm>;
  /** Heading shown above the address block. Defaults to "Address". */
  title?: string;
}

// biome-ignore lint/suspicious/noExplicitAny: TForm is constrained at the caller; field-paths are validated when the parent form types include the address keys.
type AddressControl = Control<any>;

export function AddressFields<TForm extends FieldValues>({
  control,
  title = "Address",
}: AddressFieldsProps<TForm>) {
  const c = control as AddressControl;
  return (
    <FormSection title={title}>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <TextField control={c} label="Street" name="street" placeholder="Main St" />
        <TextField
          control={c}
          inputClassName="w-24"
          label="House no."
          name="houseNumber"
          placeholder="12"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        <TextField
          control={c}
          inputClassName="w-32"
          label="Postal code"
          name="postalCode"
          placeholder="60200"
        />
        <TextField control={c} label="City" name="city" placeholder="Brno" />
      </div>
      <TextField control={c} label="Country" name="country" placeholder="Czech Republic" />
    </FormSection>
  );
}
