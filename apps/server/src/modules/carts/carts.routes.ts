import { Elysia, status } from "elysia";
import { z } from "zod";
import { authPlugin } from "../auth";
import { verifyClerkToken } from "../auth/auth.utils";
import { usersService } from "../users/users.service";
import { cartsService } from "./carts.service";

const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int(),
});

const productInCart = z.object({
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  description: z.string().nullable(),
  id: z.string(),
  isBundle: z.boolean(),
  name: z.string(),
  price: z.string(),
  quantity: z.number().int(),
  shopId: z.string(),
  updatedAt: z.date().nullable(),
});

const cartItemResponse = z.object({
  cartId: z.string(),
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  id: z.string(),
  product: productInCart,
  productId: z.string(),
  quantity: z.number().int(),
  updatedAt: z.date(),
});

const cartResponse = z.object({
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  id: z.string(),
  items: z.array(cartItemResponse),
  sessionId: z.string().nullable(),
  updatedAt: z.date(),
  userId: z.string().nullable(),
});

export const cartsRoutes = new Elysia({ prefix: "/carts", tags: ["carts"] })
  .use(authPlugin)
  .derive(async ({ headers, cookie: { guest_session_id } }) => {
    const payload = await verifyClerkToken(headers.authorization);
    if (payload) {
      const dbUser = await usersService.lazyGetOrCreate(payload.sub);
      const guestSessionId = guest_session_id?.value;
      if (typeof guestSessionId === "string") {
        await cartsService.mergeOnLogin(dbUser.id, guestSessionId);
        guest_session_id?.remove();
      }
      return { sessionId: undefined as string | undefined, user: dbUser };
    }
    return { sessionId: guest_session_id?.value as string | undefined, user: undefined };
  })

  .get(
    "/",
    async ({ user, sessionId }) => {
      if (user) return (await cartsService.getCartForUser(user.id)) ?? null;
      if (sessionId) return (await cartsService.getCartForSession(sessionId)) ?? null;
      return status(400, "No user or session found");
    },
    {
      detail: {
        description: "Returns the cart for the authenticated user or guest session.",
        summary: "Get current cart",
      },
      response: { 200: cartResponse.nullable(), 400: z.string() },
    }
  )

  .post(
    "/items",
    async ({ user, sessionId, body }) => {
      await cartsService.addItem({ sessionId, userId: user?.id }, body.productId, body.quantity);
      return status(201, "Item added");
    },
    {
      body: cartItemSchema,
      detail: {
        summary: "Add item to cart",
      },
      response: { 201: z.string() },
    }
  )

  .put(
    "/items/:productId",
    async ({ user, sessionId, params, body }) => {
      await cartsService.updateItemQuantity(
        { sessionId, userId: user?.id },
        params.productId,
        body.quantity
      );
      return "Quantity updated";
    },
    {
      body: z.object({ quantity: z.number().int() }),
      detail: {
        summary: "Update item quantity",
      },
      params: z.object({ productId: z.string() }),
      response: { 200: z.string() },
    }
  )

  .delete(
    "/items/:productId",
    async ({ user, sessionId, params, set }) => {
      await cartsService.removeItem({ sessionId, userId: user?.id }, params.productId);
      set.status = 204;
    },
    {
      detail: {
        summary: "Remove item from cart",
      },
      params: z.object({ productId: z.string() }),
    }
  );
