import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";
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

interface RegularFormValues {
  endTime: string;
  startTime: string;
  type: "open" | "closed";
  validFrom: string;
  validTo?: string;
}

// Iteration order = display order (Mon first). `dow` keeps the BE 0=Sunday
// convention so values selected by the user serialize correctly.
const DAYS = [
  { dow: 1, name: "Monday" },
  { dow: 2, name: "Tuesday" },
  { dow: 3, name: "Wednesday" },
  { dow: 4, name: "Thursday" },
  { dow: 5, name: "Friday" },
  { dow: 6, name: "Saturday" },
  { dow: 0, name: "Sunday" },
];

export function AvailabilityRegularForm({ shopId, onSuccess }: AvailabilityRegularFormProps) {
  const mutation = usePostShopsByIdAvailabilityRegular();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Set<number>>(() => new Set([1, 2, 3, 4, 5]));
  const [dayError, setDayError] = useState<string | null>(null);

  const form = useForm<RegularFormValues>({
    defaultValues: {
      endTime: "17:00",
      startTime: "09:00",
      type: "open",
      validFrom: new Date().toISOString().split("T")[0],
    },
  });

  const toggleDay = (day: number) => {
    setDayError(null);
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const onSubmit = async (data: RegularFormValues) => {
    if (selectedDays.size === 0) {
      setDayError("Pick at least one day.");
      return;
    }

    setIsSubmitting(true);
    try {
      // BE accepts one row per dow — fan out the same time block over each
      // selected weekday.
      for (const day of selectedDays) {
        await mutation.mutateAsync({
          data: {
            ...data,
            dow: String(day),
          } as PostShopsByIdAvailabilityRegularMutationRequest,
          id: shopId,
        });
      }
      onSuccess();
    } catch (_error) {
      // Error handling is delegated to the mutation hook's error state
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormItem>
          <FormLabel>Days of week</FormLabel>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DAYS.map(({ name, dow }) => {
              const id = `dow-${dow}`;
              return (
                <Label
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-2 text-sm hover:bg-muted"
                  htmlFor={id}
                  key={dow}
                >
                  <Checkbox
                    checked={selectedDays.has(dow)}
                    id={id}
                    onCheckedChange={() => toggleDay(dow)}
                  />
                  {name}
                </Label>
              );
            })}
          </div>
          <FormDescription>
            One entry will be created per selected day with the same hours below.
          </FormDescription>
          {dayError && (
            <p className="text-sm text-destructive" role="alert">
              {dayError}
            </p>
          )}
        </FormItem>

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
          {(() => {
            if (!(isSubmitting || mutation.isPending)) {
              return selectedDays.size > 1
                ? `Add hours for ${selectedDays.size} days`
                : "Add Hours";
            }
            return "Adding...";
          })()}
        </Button>
      </form>
    </Form>
  );
}
