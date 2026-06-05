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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const wineFormSchema = z.object({
  alcoholContent: z.string().regex(/^\d{1,2}(\.\d{1,2})?$/, { message: "Use a number like 12.5" }),
  attribution: z
    .string()
    .refine((v) => v.trim().length > 0, { message: "Attribution is required" }),
  color: z.enum(["red", "white", "rosé", "orange", "gray", "tawny", "yellow"]),
  composition: z
    .string()
    .refine((v) => v.trim().length > 0, { message: "Composition is required" }),
  description: z
    .string()
    .refine((v) => v.trim().length > 0, { message: "Description is required" }),
  name: z.string().refine((v) => v.trim().length > 0, { message: "Name is required" }),
  quantity: z.coerce.number().int().min(0, { message: "Quantity cannot be negative" }),
  region: z.string().refine((v) => v.trim().length > 0, { message: "Region is required" }),
  type: z.enum(["still", "sparkling", "fortified", "dessert"]),
  vintageYear: z.coerce
    .number()
    .int()
    .min(1800, { message: "Year must be 1800 or later" })
    .max(2100, { message: "Year must be 2100 or earlier" }),
  volumeMl: z.coerce.number().int().min(1, { message: "Volume must be at least 1 ml" }),
});

export type WineFormValues = z.infer<typeof wineFormSchema>;

interface WineFormProps {
  defaultValues: Partial<WineFormValues>;
  onSubmit: (values: WineFormValues) => void;
  isPending: boolean;
  submitLabel: string;
}

export function WineForm({ defaultValues, onSubmit, isPending, submitLabel }: WineFormProps) {
  const resolver = useMemo<Resolver<WineFormValues>>(
    () => async (values) => {
      const result = wineFormSchema.safeParse(values);
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

  const form = useForm<WineFormValues>({
    defaultValues: {
      alcoholContent: "12.5",
      attribution: "",
      color: "red",
      composition: "",
      description: "",
      name: "",
      quantity: 0,
      region: "",
      type: "still",
      vintageYear: new Date().getFullYear() - 1,
      volumeMl: 750,
      ...defaultValues,
    },
    mode: "onSubmit",
    resolver,
    reValidateMode: "onChange",
  });

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wine name</FormLabel>
              <FormControl>
                <Input placeholder="Pálava 2024" {...field} />
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
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attribution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attribution</FormLabel>
              <FormControl>
                <Input placeholder="Vinařství Lechovice" {...field} />
              </FormControl>
              <FormDescription>The producer / vineyard name on the label.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="rosé">Rosé</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="gray">Gray</SelectItem>
                    <SelectItem value="tawny">Tawny</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="still">Still</SelectItem>
                    <SelectItem value="sparkling">Sparkling</SelectItem>
                    <SelectItem value="fortified">Fortified</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region</FormLabel>
                <FormControl>
                  <Input placeholder="Moravia" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="composition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Composition</FormLabel>
                <FormControl>
                  <Input placeholder="Pálava 100%" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="vintageYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vintage year</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="alcoholContent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alcohol %</FormLabel>
                <FormControl>
                  <Input placeholder="12.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="volumeMl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volume (ml)</FormLabel>
                <FormControl>
                  <Input min="1" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial stock</FormLabel>
              <FormControl>
                <Input min="0" type="number" {...field} />
              </FormControl>
              <FormDescription>Bottles available for retail allocation.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" disabled={isPending} type="submit">
          {isPending ? "Saving…" : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
