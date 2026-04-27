import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { verifyClerkToken } from "../auth/auth.utils";
import { cartsService } from "../carts/carts.service";
import { usersService } from "../users/users.service";
import type { CheckoutData } from "./orders.service";
import { ordersService } from "./orders.service";

const addressSchema = t.Object({
  city: t.String(),
  country: t.String(),
  houseNumber: t.String(),
  postalCode: t.String(),
  street: t.String(),
});

const orderResponse = t.Object({
  billingAddressId: t.String(),
  createdAt: t.Date(),
  deletedAt: t.Union([t.Date(), t.Null()]),
  deliveryType: t.String(),
  discount: t.String(),
  guestEmail: t.Union([t.String(), t.Null()]),
  guestName: t.Union([t.String(), t.Null()]),
  guestSessionId: t.Union([t.String(), t.Null()]),
  id: t.String(),
  paymentMethod: t.String(),
  paymentStatus: t.String(),
  shippingAddressId: t.String(),
  shippingFee: t.String(),
  status: t.String(),
  totalPrice: t.String(),
  updatedAt: t.Union([t.Date(), t.Null()]),
  userId: t.Union([t.String(), t.Null()]),
});

const checkoutBody = t.Object({
  billingAddress: t.Optional(addressSchema),
  deliveryType: t.Union([t.Literal("pickup"), t.Literal("shipping")]),
  guestEmail: t.Optional(t.String()),
  guestName: t.Optional(t.String()),
  paymentMethod: t.Union([
    t.Literal("card"),
    t.Literal("bank_transfer"),
    t.Literal("cash_on_delivery"),
  ]),
  shippingAddress: addressSchema,
});

export const ordersRoutes = new Elysia({ prefix: "/orders", tags: ["orders"] })
  .use(authPlugin)
  .derive(async ({ headers, cookie: { guest_session_id } }) => {
    const payload = await verifyClerkToken(headers.authorization);
    if (payload) {
      const dbUser = await usersService.lazyGetOrCreate(payload.sub, payload);
      const guestSessionId = guest_session_id?.value;
      if (typeof guestSessionId === "string") {
        await cartsService.mergeOnLogin(dbUser.id, guestSessionId);
        guest_session_id?.remove();
      }
      return { sessionId: undefined as string | undefined, user: dbUser };
    }
    return { sessionId: guest_session_id?.value as string | undefined, user: undefined };
  })

  .post(
    "/checkout",
    async ({ user, sessionId, body }) => {
      if (!(user || sessionId)) return status(400, "No user or guest session");
      if (!(user || body.guestEmail)) return status(400, "Email required for guest checkout");

      try {
        const checkoutData = body as CheckoutData;
        return await ordersService.createOrder({ sessionId, userId: user?.id }, checkoutData);
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message.startsWith("PRODUCT_DELETED")) {
            return status(410, e.message);
          }
          if (e.message.startsWith("INSUFFICIENT_STOCK")) {
            return status(422, e.message);
          }
        }
        throw e;
      }
    },
    {
      body: checkoutBody,
      detail: {
        description:
          "Create an order from the current cart. Works for both authenticated users and guests.",
        summary: "Checkout",
      },
      response: { 200: orderResponse, 400: t.String(), 410: t.String(), 422: t.String() },
    }
  )

  .get(
    "/:id",
    async ({ user, params }) => {
      if (!user) return status(401, "Auth required");
      try {
        return await ordersService.getOrder(params.id, user.id);
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === "NOT_FOUND") return status(404, "Not found");
          if (e.message === "FORBIDDEN") return status(403, "Forbidden");
        }
        throw e;
      }
    },
    {
      detail: {
        description: "Returns an order by ID. Only the owning user can access it.",
        summary: "Get order by ID",
      },
      params: t.Object({ id: t.String() }),
      response: { 200: orderResponse, 401: t.String(), 403: t.String(), 404: t.String() },
    }
  );
