import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { usePatchShopsById } from "@/generated/hooks/usePatchShopsById";
import type { GetShopsById200 } from "@/generated/types/GetShopsById";
import type { PatchShopsByIdMutationRequest } from "@/generated/types/PatchShopsById";

interface ShopEditFormProps {
  shop: GetShopsById200;
}

interface FormData {
  name: string;
  description: string;
  address: {
    street: string;
    houseNumber: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export function ShopEditForm({ shop }: ShopEditFormProps) {
  const mutation = usePatchShopsById();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      address: {
        city: shop.address.city,
        country: shop.address.country,
        houseNumber: shop.address.houseNumber,
        postalCode: shop.address.postalCode,
        street: shop.address.street,
      },
      description: shop.description,
      name: shop.name,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const submitData: PatchShopsByIdMutationRequest = {
        address: data.address,
        description: data.description,
        name: data.name,
      };

      await mutation.mutateAsync({
        data: submitData,
        id: shop.id,
      });

      setSubmitSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update shop. Please try again.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Shop Details</CardTitle>
        <CardDescription>
          Update your shop name, description, and address information
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Success Message */}
            {submitSuccess && (
              <div className="rounded-md bg-green-50 dark:bg-green-950 p-4 text-sm text-green-800 dark:text-green-200">
                Shop updated successfully!
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                {submitError}
              </div>
            )}

            {/* Shop Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter shop name" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormDescription>
                    The name of your shop as it appears to customers
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      placeholder="Tell customers about your shop"
                      rows={4}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>A brief description of your shop</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Fields */}
            <div className="space-y-4">
              <div className="text-sm font-medium">Address</div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Street */}
                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Street</FormLabel>
                      <FormControl>
                        <Input placeholder="Main Street" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* House Number */}
                <FormField
                  control={form.control}
                  name="address.houseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">House Number</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* City */}
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Postal Code */}
                <FormField
                  control={form.control}
                  name="address.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Country */}
                <FormField
                  control={form.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button
              disabled={isSubmitting}
              onClick={() => form.reset()}
              type="button"
              variant="outline"
            >
              Reset
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
