import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, Controller, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

import { Button } from "./ui/button";
import { Field, FieldError, FieldDescription, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const task3Schema = z
  .object({
    name: z.string().min(2, "Name must have at least 2 characters."),
    price: z.number().positive("Price must be greater than 0."),
    category: z.string().min(1, "Please select a category."),
    hasDiscount: z.boolean(),
    discountCode: z.string(),
  }).refine(
    (values) => {
      if (!values.hasDiscount) return true;
      return values.discountCode.trim().length > 0;
    },
    {
      path: ["discountCode"],
      message: "Discount code is required when discount is enabled.",
    }
  );

type Task3Values = z.infer<typeof task3Schema>;

export function ShadcnProductForm() {
  const { handleSubmit, control } = useForm<Task3Values>({
    resolver: zodResolver(task3Schema),
    defaultValues: {
      name: "",
      price: 0,
      category: "",
      hasDiscount: false,
      discountCode: "",
    },
  });

  const hasDiscount = useWatch({ control, name: "hasDiscount" });

  const onSubmit: SubmitHandler<Task3Values> = (data) => {
    console.log("Valid data:", data);
  };

  return (
    <form className="grid gap-6 w-full max-w-md" onSubmit={handleSubmit(onSubmit)}>
      
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Product Name</FieldLabel>
            <Input 
              {...field} 
              id={field.name} 
              placeholder="e.g. Mechanical Keyboard" 
              aria-invalid={fieldState.invalid} 
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        control={control}
        name="category"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Category</FieldLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="food">Food</SelectItem>
              </SelectContent>
            </Select>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        control={control}
        name="price"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Price ($)</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="number"
              step="0.01"
              aria-invalid={fieldState.invalid}
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        control={control}
        name="hasDiscount"
        render={({ field }) => (
          <Field orientation="horizontal" className="items-center gap-3 p-2 border rounded-md">
            <input
              id={field.name}
              type="checkbox"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <Label htmlFor={field.name} className="cursor-pointer">
              Enable promotional discount
            </Label>
          </Field>
        )}
      />

      {hasDiscount && (
        <Controller
          control={control}
          name="discountCode"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Discount Code</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="SAVE20"
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>Enter a valid seasonal code.</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      )}

      <Button className="w-full shadow-lg" type="submit">
        Save Product
      </Button>
    </form>
  );
}