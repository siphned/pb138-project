import { useNavigate } from "@tanstack/react-router";
import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { useGetUsersMeAddresses, usePostOrdersCheckout } from "@/generated";
import type { GetCarts200 } from "@/generated/types/GetCarts";
import type { PostOrdersCheckout200 } from "@/generated/types/PostOrdersCheckout";
import { AddressForm, type AddressFormValues } from "./AddressForm";

type CheckoutSectionProps = {
  cart: GetCarts200 | null;
  onDeliveryTypeChange?: (type: "pickup" | "shipping") => void;
};

export function CheckoutSection({ cart, onDeliveryTypeChange }: CheckoutSectionProps) {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const { user } = useUser();

  const { data: userAddresses } = useGetUsersMeAddresses();
  const checkout = usePostOrdersCheckout();

  const total = useMemo(() => {
    if (!cart) return 0;
    return cart.items.reduce((acc, item) => {
      const price = Number.parseFloat(item.product.price);
      const quantity = Number(item.quantity);
      return acc + price * quantity;
    }, 0);
  }, [cart]);

  const defaultAddressValues = useMemo(() => {
    const shipping = userAddresses?.shipping;
    if (!shipping) return {};

    return {
      city: shipping.city,
      country: shipping.country,
      houseNumber: shipping.houseNumber,
      postalCode: shipping.postalCode,
      street: shipping.street,
    };
  }, [userAddresses]);

  const handleSubmit = (values: AddressFormValues) => {
    checkout.mutate(
      {
        data: {
          billingAddress: values.billingAddressSameAsShipping
            ? undefined
            : {
                city: values.city,
                country: values.country,
                houseNumber: values.houseNumber,
                postalCode: values.postalCode,
                street: values.street,
              },
          deliveryType: values.deliveryType,
          guestEmail: values.guestEmail || undefined,
          guestName: values.guestName || undefined,
          paymentMethod: values.paymentMethod,
          shippingAddress: {
            city: values.city,
            country: values.country,
            houseNumber: values.houseNumber,
            postalCode: values.postalCode,
            street: values.street,
          },
        },
      },
      {
        onSuccess: (result: PostOrdersCheckout200) => {
          navigate({
            search: { orderId: result.id },
            to: "/checkout/confirmed",
          });
        },
      }
    );
  };

  const isCartEmpty = !cart || cart.items.length === 0;

  return (
    <div className="flex flex-col gap-3">
      <CardTitle className="font-heading text-2xl ">Checkout</CardTitle>
      <Card className="h-fit">
        <CardHeader />
        <CardContent className="flex flex-col gap-6">
          <AddressForm
            defaultValues={defaultAddressValues}
            isSubmitting={checkout.isPending}
            onDeliveryTypeChange={onDeliveryTypeChange}
            onSubmit={handleSubmit}
            ref={formRef}
            showGuestFields={!user}
          />
          <Button
            className="w-full"
            disabled={isCartEmpty || checkout.isPending}
            onClick={() => formRef.current?.requestSubmit()}
          >
            {checkout.isPending ? "Processing..." : `Confirm Order — €${total.toFixed(2)}`}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            By purchasing you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
