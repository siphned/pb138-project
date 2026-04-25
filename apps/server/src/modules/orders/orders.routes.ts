import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { verifyClerkToken } from "../auth/auth.utils";
import { cartsService } from "../carts/carts.service";
import { usersService } from "../users/users.service";
import type { CheckoutData } from "./orders.service";
import { ordersService } from "./orders.service";

const addressSchema = t.Object({
  country: t.String(),
  city: t.String(),
  postalCode: t.String(),
  street: t.String(),
  houseNumber: t.String(),
});

const orderResponse = t.Object({
  id: t.String(),
  userId: t.Union([t.String(), t.Null()]),
  guestSessionId: t.Union([t.String(), t.Null()]),
  guestEmail: t.Union([t.String(), t.Null()]),
  guestName: t.Union([t.String(), t.Null()]),
  shippingFee: t.String(),
  discount: t.String(),
  paymentStatus: t.String(),
  paymentMethod: t.String(),
  totalPrice: t.String(),
  status: t.String(),
  deliveryType: t.String(),
  shippingAddressId: t.String(),
  billingAddressId: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Union([t.Date(), t.Null()]),
  deletedAt: t.Union([t.Date(), t.Null()]),
});

const checkoutBody = t.Object({
  guestEmail: t.Optional(t.String()),
  guestName: t.Optional(t.String()),
  paymentMethod: t.Union([
    t.Literal("card"),
    t.Literal("bank_transfer"),
    t.Literal("cash_on_delivery"),
  ]),
  deliveryType: t.Union([t.Literal("pickup"), t.Literal("shipping")]),
  shippingAddress: addressSchema,
  billingAddress: t.Optional(addressSchema),
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
      return { user: dbUser, sessionId: undefined as string | undefined };
    }
    return { user: undefined, sessionId: guest_session_id?.value as string | undefined };
  })

  .post(
    "/checkout",
    async ({ user, sessionId, body }) => {
      if (!(user || sessionId)) return status(400, "No user or guest session");
      if (!(user || body.guestEmail)) return status(400, "Email required for guest checkout");

      try {
        const checkoutData = body as CheckoutData;
        return await ordersService.createOrder({ userId: user?.id, sessionId }, checkoutData);
      } catch (e: unknown) {
        if (e instanceof Error && e.message.startsWith("INSUFFICIENT_STOCK")) {
          return status(422, e.message);
        }
        throw e;
      }
    },
    {
      body: checkoutBody,
      response: { 200: orderResponse, 400: t.String(), 422: t.String() },
      detail: {
        summary: "Checkout",
        description:
          "Create an order from the current cart. Works for both authenticated users and guests.",
      },
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
      params: t.Object({ id: t.String() }),
      response: { 200: orderResponse, 401: t.String(), 403: t.String(), 404: t.String() },
      detail: {
        summary: "Get order by ID",
        description: "Returns an order by ID. Only the owning user can access it.",
      },
    }
  );
