import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { getCartsQueryKey } from "@/generated/hooks/useGetCarts";
import { useGetUsersMeAddresses } from "@/generated/hooks/useGetUsersMeAddresses";
import { usePostOrdersCheckout } from "@/generated/hooks/usePostOrdersCheckout";
import type { GetCarts200 } from "@/generated/types/GetCarts";
import { formatEur } from "@/lib/utils";
import { AddressForm, type AddressFormValues } from "@/routes/-components/AddressForm";
import { CartSummary } from "@/routes/-components/CartSummary";

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Checkout failed. Please try again.";
}

interface CheckoutSectionProps {
  cart: GetCarts200 | null;
  deliveryType: "pickup" | "shipping";
  onDeliveryTypeChange: (value: "pickup" | "shipping") => void;
}

export function CheckoutSection({
  cart,
  deliveryType,
  onDeliveryTypeChange,
}: CheckoutSectionProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const checkout = usePostOrdersCheckout<unknown>();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const { data: addresses } = useGetUsersMeAddresses({ query: { enabled: !!user } });

  const total = useMemo(() => {
    if (!cart) return 0;
    const subtotal = cart.items.reduce((acc, item) => {
      const price = Number.parseFloat(item.product.price);
      const quantity = Number(item.quantity);
      return acc + price * quantity;
    }, 0);
    const deliveryCost = deliveryType === "pickup" ? 0.0 : 15.0;
    return subtotal + deliveryCost;
  }, [cart, deliveryType]);

  const savedShipping = useMemo(() => {
    const s = addresses?.shipping;
    if (!s) return null;
    return {
      city: s.city,
      country: s.country,
      houseNumber: s.houseNumber,
      postalCode: s.postalCode,
      street: s.street,
    };
  }, [addresses]);

  const savedBilling = useMemo(() => {
    const b = addresses?.billing;
    if (!b) return null;
    return {
      city: b.city,
      country: b.country,
      houseNumber: b.houseNumber,
      postalCode: b.postalCode,
      street: b.street,
    };
  }, [addresses]);

  const defaultAddressValues = useMemo(
    () => (savedShipping ? { ...savedShipping } : {}),
    [savedShipping]
  );

  const handleSubmit = async (data: AddressFormValues) => {
    setCheckoutError(null);
    const billingAddress = data.billingAddressSameAsShipping
      ? undefined
      : {
          city: data.billingCity,
          country: data.billingCountry,
          houseNumber: data.billingHouseNumber,
          postalCode: data.billingPostalCode,
          street: data.billingStreet,
        };

    try {
      const result = await checkout.mutateAsync({
        data: {
          billingAddress,
          deliveryType: data.deliveryType,
          guestEmail: data.guestEmail || undefined,
          guestName: data.guestName || undefined,
          paymentMethod: data.paymentMethod,
          shippingAddress: {
            city: data.city,
            country: data.country,
            houseNumber: data.houseNumber,
            postalCode: data.postalCode,
            street: data.street,
          },
        },
      });

      await navigate({ search: { orderId: result.id }, to: "/checkout/confirmed" });
      queryClient.invalidateQueries({ queryKey: getCartsQueryKey() });
    } catch (err) {
      setCheckoutError(toErrorMessage(err));
    }
  };

  const isCartEmpty = !cart || cart.items.length === 0;

  // Guests can't check out directly: prompt them to authenticate. The guest cart
  // merges into their account automatically on the first signed-in request
  // (carts.routes.ts derive → mergeOnLogin), so their items carry over.
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Log in or create an account to finish your order. Your cart will be saved.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1"
              render={<Link search={{ redirect: "/cart" }} to="/auth/login" />}
            >
              Log in
            </Button>
            <Button
              className="flex-1"
              render={<Link search={{ redirect: "/cart" }} to="/auth/register" />}
              variant="outline"
            >
              Create account
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formFooter = (
    <div className="space-y-4 border-t border-border pt-4">
      {!isCartEmpty && <CartSummary deliveryType={deliveryType} items={cart.items} />}
      {checkoutError && (
        <div
          aria-live="polite"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {checkoutError}
        </div>
      )}
      <Button className="w-full" disabled={isCartEmpty || checkout.isPending} type="submit">
        {checkout.isPending ? "Processing..." : `Confirm Order — ${formatEur(total)}`}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        By purchasing you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
      </CardHeader>
      <CardContent>
        <AddressForm
          defaultValues={defaultAddressValues}
          footer={formFooter}
          isSubmitting={checkout.isPending}
          onDeliveryTypeChange={onDeliveryTypeChange}
          onSubmit={handleSubmit}
          savedBilling={savedBilling}
          savedShipping={savedShipping}
          showGuestFields={!user}
        />
      </CardContent>
    </Card>
  );
}
