import { Elysia, status } from "elysia";
import { z } from "zod";
import { authPlugin } from "../auth";
import { resolveCallerRoles } from "../auth/auth.plugin";
import { verifyClerkToken } from "../auth/auth.utils";
import { cartsService } from "../carts/carts.service";
import { usersService } from "../users/users.service";
import type { CheckoutData } from "./orders.service";
import { ordersService } from "./orders.service";

const addressSchema = z.object({
  city: z.string(),
  country: z.string(),
  houseNumber: z.string(),
  postalCode: z.string(),
  street: z.string(),
});

const addressWithIdSchema = z.object({
  city: z.string(),
  country: z.string(),
  houseNumber: z.string(),
  id: z.string(),
  postalCode: z.string(),
  street: z.string(),
});

const orderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  product: z.object({
    id: z.string(),
    name: z.string(),
  }),
  productId: z.string(),
  quantity: z.number(),
  shopId: z.string(),
  unitPriceAtPurchase: z.string(),
});

const orderResponse = z.object({
  billingAddressId: z.string(),
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  deliveryType: z.string(),
  discount: z.string(),
  guestEmail: z.string().nullable(),
  guestName: z.string().nullable(),
  guestSessionId: z.string().nullable(),
  id: z.string(),
  paymentMethod: z.string(),
  paymentStatus: z.string(),
  shippingAddressId: z.string(),
  shippingFee: z.string(),
  status: z.string(),
  totalPrice: z.string(),
  updatedAt: z.date().nullable(),
  userId: z.string().nullable(),
});

const orderDetailedResponse = z.object({
  billingAddress: addressWithIdSchema,
  billingAddressId: z.string(),
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  deliveryType: z.string(),
  discount: z.string(),
  guestEmail: z.string().nullable(),
  guestName: z.string().nullable(),
  guestSessionId: z.string().nullable(),
  id: z.string(),
  items: z.array(orderItemSchema),
  paymentMethod: z.string(),
  paymentStatus: z.string(),
  shippingAddress: addressWithIdSchema,
  shippingAddressId: z.string(),
  shippingFee: z.string(),
  status: z.string(),
  totalPrice: z.string(),
  updatedAt: z.date().nullable(),
  userId: z.string().nullable(),
});

const checkoutBody = z.object({
  billingAddress: addressSchema.optional(),
  deliveryType: z.enum(["pickup", "shipping"]),
  guestEmail: z.string().optional(),
  guestName: z.string().optional(),
  paymentMethod: z.enum(["card", "bank_transfer", "cash_on_delivery"]),
  shippingAddress: addressSchema,
});

export const ordersRoutes = new Elysia({ prefix: "/orders", tags: ["orders"] })
  .use(authPlugin)
  .derive(async ({ headers, cookie: { guest_session_id } }) => {
    const payload = await verifyClerkToken(headers.authorization);
    if (payload) {
      const dbUser = await usersService.lazyGetOrCreate(payload.sub);
      // Resolve roles from DB if the JWT didn't include the `roles` claim
      // — see auth.plugin.ts for the rationale.
      const callerRoles = await resolveCallerRoles(payload.roles, dbUser.id);
      const enrichedPayload = {
        ...payload,
        roles: callerRoles as ("customer" | "winemaker" | "shop_owner" | "admin")[],
      };

      const guestSessionId = guest_session_id?.value;
      if (typeof guestSessionId === "string") {
        await cartsService.mergeOnLogin(dbUser.id, guestSessionId);
        guest_session_id?.remove();
      }
      return {
        clerkPayload: enrichedPayload,
        isAdmin: callerRoles.includes("admin"),
        sessionId: undefined as string | undefined,
        user: dbUser,
      };
    }
    return {
      clerkPayload: null as Awaited<ReturnType<typeof verifyClerkToken>>,
      isAdmin: false,
      sessionId: guest_session_id?.value as string | undefined,
      user: undefined,
    };
  })

  .get(
    "/",
    async ({ user, clerkPayload, query }) => {
      if (!user) return status(401, "Auth required");
      if (!query.shopId) return ordersService.listForUser(user.id);

      const roles = clerkPayload?.roles ?? [];
      const isAdmin = roles.includes("admin");
      if (!isAdmin && !roles.includes("shop_owner")) return status(403, "Forbidden");

      try {
        return await ordersService.listForShop(query.shopId, user.id, isAdmin);
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
        description:
          "Without shopId: returns the authenticated customer's order history. With shopId: returns all orders for that shop (shop_owner or admin only).",
        summary: "List orders",
      },
      query: z.object({ shopId: z.string().optional() }),
      response: { 200: z.array(orderResponse), 401: z.string(), 403: z.string(), 404: z.string() },
    }
  )

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
      response: { 200: orderResponse, 400: z.string(), 410: z.string(), 422: z.string() },
    }
  )

  .get(
    "/:id",
    async ({ user, params, isAdmin }) => {
      if (!user) return status(401, "Auth required");
      try {
        return await ordersService.getOrder(params.id, user.id, isAdmin);
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
        description:
          "Returns an order by ID with items and addresses. The owning user or an admin can access it.",
        summary: "Get order by ID",
      },
      params: z.object({ id: z.string() }),
      response: { 200: orderDetailedResponse, 401: z.string(), 403: z.string(), 404: z.string() },
    }
  )

  .patch(
    "/:id/status",
    async ({ dbUser, clerkPayload, params, body }) => {
      const isAdmin = clerkPayload.roles?.includes("admin") ?? false;
      try {
        return await ordersService.updateStatus(params.id, dbUser.id, body.status, isAdmin);
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === "NOT_FOUND") return status(404, "Not found");
          if (e.message === "FORBIDDEN") return status(403, "Forbidden");
          if (e.message === "INVALID_TRANSITION") return status(422, e.message);
        }
        throw e;
      }
    },
    {
      body: z.object({
        status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
      }),
      detail: {
        description:
          "Advance an order's status. Shop owners may only update orders containing items from their shops. Valid transitions: pending→confirmed, confirmed→shipped, shipped→delivered, any→cancelled.",
        security: [{ bearerAuth: [] }],
        summary: "Update order status",
      },
      params: z.object({ id: z.string() }),
      requireRoles: ["shop_owner", "admin"],
      response: {
        200: orderResponse,
        403: z.string(),
        404: z.string(),
        422: z.string(),
      },
    }
  );
