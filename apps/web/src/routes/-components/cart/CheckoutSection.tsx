import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { getCartsQueryKey } from "@/generated/hooks/useGetCarts";
import { useGetUsersMeAddresses } from "@/generated/hooks/useGetUsersMeAddresses";
import { usePostOrdersCheckout } from "@/generated/hooks/usePostOrdersCheckout";
import type { GetCarts200 } from "@/generated/types/GetCarts";
import { AddressForm, type AddressFormValues } from "./AddressForm";
import { CartSummary } from "./CartSummary";

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
  const formRef = useRef<HTMLFormElement>(null);

  const checkout = usePostOrdersCheckout();

  const { data: addresses } = useGetUsersMeAddresses();

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

  const defaultAddressValues = useMemo(() => {
    const shipping = addresses?.shipping;
    if (!shipping) return {};
    return {
      city: shipping.city,
      country: shipping.country,
      houseNumber: shipping.houseNumber,
      postalCode: shipping.postalCode,
      street: shipping.street,
    };
  }, [addresses]);

  const handleSubmit = async (data: AddressFormValues) => {
    const billingAddress = data.billingAddressSameAsShipping
      ? undefined
      : {
          city: data.city,
          country: data.country,
          houseNumber: data.houseNumber,
          postalCode: data.postalCode,
          street: data.street,
        };

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

    queryClient.invalidateQueries({ queryKey: getCartsQueryKey() });
    navigate({ search: { orderId: result.id }, to: "/checkout/confirmed" });
  };

  const isCartEmpty = !cart || cart.items.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AddressForm
          defaultValues={defaultAddressValues}
          isSubmitting={checkout.isPending}
          onDeliveryTypeChange={onDeliveryTypeChange}
          onSubmit={handleSubmit}
          ref={formRef}
          showGuestFields={!user}
        />
        {!isCartEmpty && <CartSummary deliveryType={deliveryType} items={cart.items} />}
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          className="w-full"
          disabled={isCartEmpty || checkout.isPending}
          onClick={() => formRef.current?.requestSubmit()}
        >
          {checkout.isPending ? "Processing..." : `Confirm Order — €${total.toFixed(2)}`}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          By purchasing you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}
