"use client";

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
    setIsSubmitting(true);
    try {
      await mutation.mutateAsync({
        data,
        id: shopId,
      });
      onSuccess();
<<<<<<< HEAD
    } catch (_error) {
      // Error handling is delegated to the mutation hook's error state
=======
    } catch {
      // Error already handled by mutation state
>>>>>>> WINE-265-final-docs
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

        <Button className="w-full" disabled={isSubmitting || mutation.isPending} type="submit">
          {isSubmitting || mutation.isPending ? "Adding..." : "Add Exception"}
        </Button>
      </form>
    </Form>
  );
}
