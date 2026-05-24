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
import { usePostShopsByIdAvailabilityRegular } from "@/generated/hooks/usePostShopsByIdAvailabilityRegular";
import type { PostShopsByIdAvailabilityRegularMutationRequest } from "@/generated/types/PostShopsByIdAvailabilityRegular";

interface AvailabilityRegularFormProps {
  shopId: string;
  onSuccess: () => void;
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AvailabilityRegularForm({ shopId, onSuccess }: AvailabilityRegularFormProps) {
  const mutation = usePostShopsByIdAvailabilityRegular();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PostShopsByIdAvailabilityRegularMutationRequest>({
    defaultValues: {
      dow: "0",
      endTime: "17:00",
      startTime: "09:00",
      type: "open",
      validFrom: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: PostShopsByIdAvailabilityRegularMutationRequest) => {
    setIsSubmitting(true);
    try {
      await mutation.mutateAsync({
        data,
        id: shopId,
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to create regular availability:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="dow"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Day of Week</FormLabel>
              <Select onValueChange={field.onChange} value={String(field.value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dayNames.map((name, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {name}
                    </SelectItem>
                  ))}
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
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("type") === "open" && (
          <>
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormDescription>Format: HH:MM (24-hour)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Closing Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormDescription>Format: HH:MM (24-hour)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="validFrom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valid From</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription>The date when these hours start applying</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="validTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valid To (Optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>Leave empty to apply indefinitely</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" disabled={isSubmitting || mutation.isPending} type="submit">
          {isSubmitting || mutation.isPending ? "Adding..." : "Add Hours"}
        </Button>
      </form>
    </Form>
  );
}
