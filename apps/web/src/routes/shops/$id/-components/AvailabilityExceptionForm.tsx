import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { usePostShopsByIdAvailabilityExceptions } from "@/generated/hooks/usePostShopsByIdAvailabilityExceptions";
import type { PostShopsByIdAvailabilityExceptionsMutationRequest } from "@/generated/types/PostShopsByIdAvailabilityExceptions";

interface AvailabilityExceptionFormProps {
  shopId: string;
  onSuccess: () => void;
}

export function AvailabilityExceptionForm({ shopId, onSuccess }: AvailabilityExceptionFormProps) {
  const mutation = usePostShopsByIdAvailabilityExceptions();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getExceptionDescription = (action: string) => {
    if (action === "closed") {
      return "The shop will be closed during this period";
    }
    if (action === "modified_hours") {
      return "Operating hours will be different from normal";
    }
    return "The shop will have a special event";
  };

  const form = useForm<PostShopsByIdAvailabilityExceptionsMutationRequest>({
    defaultValues: {
      action: "closed" as const,
      endsAt: new Date().toISOString().split("T")[0],
      reason: "",
      startsAt: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: PostShopsByIdAvailabilityExceptionsMutationRequest) => {
    // The day is spanned 00:00 → 23:59, so same-day is valid; only a strictly
    // earlier end date is wrong. Catch it here for a clear message instead of
    // letting the API reject it with a generic 400.
    form.clearErrors("endsAt");
    if (data.endsAt < data.startsAt) {
      form.setError("endsAt", {
        message: "End date can't be before the start date.",
        type: "manual",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // The date inputs yield "YYYY-MM-DD", but the API requires full ISO
      // datetimes (z.string().datetime()). Span the whole selected day in UTC.
      await mutation.mutateAsync({
        data: {
          ...data,
          endsAt: new Date(`${data.endsAt}T23:59:59.999Z`).toISOString(),
          startsAt: new Date(`${data.startsAt}T00:00:00.000Z`).toISOString(),
        },
        id: shopId,
      });
      onSuccess();
    } catch (_error) {
      // Surfaced below via mutation.error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="action"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exception Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="modified_hours">Modified Hours</SelectItem>
                  <SelectItem value="special_event">Special Event</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>{getExceptionDescription(field.value)}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startsAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Starts At</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription>When the exception begins</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endsAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ends At</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription>When the exception ends</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Holiday closure, Staff training, etc."
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>Visible to customers</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {mutation.isError && (
          <p className="text-sm text-destructive">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "Could not add the exception. Please try again."}
          </p>
        )}

        <Button className="w-full" disabled={isSubmitting || mutation.isPending} type="submit">
          {isSubmitting || mutation.isPending ? "Adding..." : "Add Exception"}
        </Button>
      </form>
    </Form>
  );
}
