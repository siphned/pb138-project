import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { verifyClerkToken } from "../auth/auth.utils";
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
    }
  )

  .get("/:id", async ({ user, params }) => {
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
  });
