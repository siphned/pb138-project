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

const eventEditFormSchema = z.object({
  capacity: z.coerce.number().int().min(1, { message: "Capacity must be at least 1" }),
  description: z.string().optional().default(""),
  endTime: z.string().refine((v) => v.trim().length > 0, { message: "End time is required" }),
  name: z.string().refine((v) => v.trim().length > 0, { message: "Name is required" }),
  startTime: z.string().refine((v) => v.trim().length > 0, { message: "Start time is required" }),
});

export type EventEditFormValues = z.infer<typeof eventEditFormSchema>;

interface EventEditFormProps {
  defaultValues: Partial<EventEditFormValues>;
  onSubmit: (values: EventEditFormValues) => void;
  isPending: boolean;
}

export function EventEditForm({ defaultValues, onSubmit, isPending }: EventEditFormProps) {
  const resolver = useMemo<Resolver<EventEditFormValues>>(
    () => async (values) => {
      const result = eventEditFormSchema.safeParse(values);
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

  const form = useForm<EventEditFormValues>({
    defaultValues: {
      capacity: 30,
      description: "",
      endTime: "",
      name: "",
      startTime: "",
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
              <FormLabel>Event name</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Textarea rows={4} {...field} />
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

        <Button className="w-full" disabled={isPending} type="submit">
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
