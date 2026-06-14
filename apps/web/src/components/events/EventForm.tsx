import { useMemo, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { z } from "zod";
import { AddressFields } from "@/components/forms/AddressFields";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { TextareaField } from "@/components/forms/TextareaField";
import { TextField } from "@/components/forms/TextField";
import { DateTimePicker } from "@/components/primitives/date-time-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const eventFormSchema = z
  .object({
    capacity: z.coerce.number().int().min(1, { message: "Capacity must be at least 1" }),
    city: z.string().refine((v) => v.trim().length > 0, { message: "City is required" }),
    country: z.string().refine((v) => v.trim().length > 0, { message: "Country is required" }),
    description: z.string().optional().default(""),
    endTime: z.string().refine((v) => v.trim().length > 0, { message: "End time is required" }),
    houseNumber: z
      .string()
      .refine((v) => v.trim().length > 0, { message: "House number is required" }),
    inviteType: z.enum(["open", "invite_only"]),
    name: z.string().refine((v) => v.trim().length > 0, { message: "Name is required" }),
    postalCode: z
      .string()
      .refine((v) => v.trim().length > 0, { message: "Postal code is required" }),
    startTime: z.string().refine((v) => v.trim().length > 0, { message: "Start time is required" }),
    street: z.string().refine((v) => v.trim().length > 0, { message: "Street is required" }),
    visibility: z.enum(["public", "private"]),
  })
  .superRefine((data, ctx) => {
    if (!data.startTime || !data.endTime) return;
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;
    if (start <= new Date()) {
      ctx.addIssue({
        code: "custom",
        message: "Start time must be in the future",
        path: ["startTime"],
      });
    }
    if (end <= start) {
      ctx.addIssue({
        code: "custom",
        message: "End time must be after start time",
        path: ["endTime"],
      });
    }
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  defaultValues: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues, images: File[]) => void;
  isPending: boolean;
  submitLabel: string;
  serverError?: string | null;
  /** When true, render an optional image picker that bubbles files up via onSubmit. */
  showImageUpload?: boolean;
}

export function EventForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
  serverError,
  showImageUpload = false,
}: EventFormProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);

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
    resolver,
    reValidateMode: "onChange",
  });

  const handleFormSubmit = (values: EventFormValues) => {
    if (imageError) return;
    onSubmit(values, imageFiles);
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleFormSubmit)}>
        <TextField
          control={form.control}
          label="Event name"
          name="name"
          placeholder="Spring Wine Tasting"
        />

        <TextareaField
          control={form.control}
          label="Description (optional)"
          name="description"
          placeholder="What's on the agenda?"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Starts</FormLabel>
                <FormControl>
                  <DateTimePicker
                    minDate={new Date()}
                    onChange={field.onChange}
                    placeholder="Pick start date and time"
                    value={field.value ?? ""}
                  />
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
                  <DateTimePicker
                    minDate={new Date()}
                    onChange={field.onChange}
                    placeholder="Pick end date and time"
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <TextField
          control={form.control}
          description="Maximum number of attendees."
          label="Capacity"
          min="1"
          name="capacity"
          type="number"
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

        <AddressFields control={form.control} title="Event location" />

        {showImageUpload && (
          <ImageUploadField
            description="PNG, JPEG, WebP, or AVIF up to 10 MB each. Uploaded after the event is created."
            onErrorChange={setImageError}
            onFilesChange={setImageFiles}
          />
        )}

        {serverError && (
          <p className="text-sm text-destructive" role="alert">
            {serverError}
          </p>
        )}

        <SubmitButton disabled={!!imageError} isPending={isPending}>
          {submitLabel}
        </SubmitButton>
      </form>
    </Form>
  );
}
