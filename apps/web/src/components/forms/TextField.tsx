import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface TextFieldProps<TForm extends FieldValues> {
  control: Control<TForm>;
  name: FieldPath<TForm>;
  label: string;
  placeholder?: string;
  description?: string;
  type?: "text" | "number" | "email" | "tel" | "url";
  min?: number | string;
  step?: string;
  className?: string;
  /** Optional className on the input itself (e.g. fixed width). */
  inputClassName?: string;
}

export function TextField<TForm extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  type = "text",
  min,
  step,
  className,
  inputClassName,
}: TextFieldProps<TForm>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              className={inputClassName}
              min={min}
              placeholder={placeholder}
              step={step}
              type={type}
              {...field}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
