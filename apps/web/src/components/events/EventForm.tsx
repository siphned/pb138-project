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

const eventFormSchema = z.object({
  name: z.string().refine((v) => v.trim().length > 0, { message: "Name is required" }),
  description: z.string().optional().default(""),
  capacity: z.coerce.number().int().min(1, { message: "Capacity must be at least 1" }),
  startTime: z.string().refine((v) => v.trim().length > 0, { message: "Start time is required" }),
  endTime: z.string().refine((v) => v.trim().length > 0, { message: "End time is required" }),
  inviteType: z.enum(["open", "invite_only"]),
  visibility: z.enum(["public", "private"]),
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

export type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  defaultValues: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => void;
  isPending: boolean;
  submitLabel: string;
}

export function EventForm({ defaultValues, onSubmit, isPending, submitLabel }: EventFormProps) {
  const resolver = useMemo<Resolver<EventFormValues>>(
    () => async (values) => {
      const result = eventFormSchema.safeParse(values);
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

  const form = useForm<EventFormValues>({
    defaultValues: {
      capacity: 30,
      city: "",
      country: "",
      description: "",
      endTime: "",
      houseNumber: "",
      inviteType: "open",
      name: "",
      postalCode: "",
      startTime: "",
      street: "",
      visibility: "public",
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
              <FormLabel>Event name</FormLabel>
              <FormControl>
                <Input placeholder="Spring Wine Tasting" {...field} />
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
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="What's on the agenda?" rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Starts</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ends</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input min="1" type="number" {...field} />
              </FormControl>
              <FormDescription>Maximum number of attendees.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="inviteType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invite type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="invite_only">Invite-only</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 rounded-md border border-border p-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Event location
          </h3>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input placeholder="Cellar Street" {...field} />
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
                    <Input className="w-24" placeholder="1" {...field} />
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
                    <Input className="w-32" placeholder="69102" {...field} />
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
                    <Input placeholder="Velké Bílovice" {...field} />
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
