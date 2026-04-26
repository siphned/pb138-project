import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { verifyClerkToken } from "../auth/auth.utils";
import { usersService } from "../users/users.service";
import { cartsService } from "./carts.service";

const cartItemSchema = t.Object({
  productId: t.String(),
  quantity: t.Integer(),
});

const productInCart = t.Object({
  id: t.String(),
  shopId: t.String(),
  name: t.String(),
  description: t.Union([t.String(), t.Null()]),
  price: t.String(),
  quantity: t.Integer(),
  isBundle: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Union([t.Date(), t.Null()]),
  deletedAt: t.Union([t.Date(), t.Null()]),
});

const cartItemResponse = t.Object({
  id: t.String(),
  cartId: t.String(),
  productId: t.String(),
  quantity: t.Integer(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  deletedAt: t.Union([t.Date(), t.Null()]),
  product: productInCart,
});

const cartResponse = t.Object({
  id: t.String(),
  userId: t.Union([t.String(), t.Null()]),
  sessionId: t.Union([t.String(), t.Null()]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  deletedAt: t.Union([t.Date(), t.Null()]),
  items: t.Array(cartItemResponse),
});

export const cartsRoutes = new Elysia({ prefix: "/carts", tags: ["carts"] })
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

  .get(
    "/",
    async ({ user, sessionId }) => {
      if (user) return (await cartsService.getCartForUser(user.id)) ?? null;
      if (sessionId) return (await cartsService.getCartForSession(sessionId)) ?? null;
      return status(400, "No user or session found");
    },
    {
      response: { 200: t.Union([cartResponse, t.Null()]), 400: t.String() },
      detail: {
        summary: "Get current cart",
        description: "Returns the cart for the authenticated user or guest session.",
      },
    }
  )

  .post(
    "/items",
    async ({ user, sessionId, body }) => {
      try {
        await cartsService.addItem({ userId: user?.id, sessionId }, body.productId, body.quantity);
        return status(201, "Item added");
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === "PRODUCT_DELETED") {
            return status(410, "Product is no longer available");
          }
        }
        throw e;
      }
    },
    {
      body: cartItemSchema,
      response: { 201: t.String(), 410: t.String() },
      detail: {
        summary: "Add item to cart",
      },
    }
  )

  .put(
    "/items/:productId",
    async ({ user, sessionId, params, body }) => {
      await cartsService.updateItemQuantity(
        { userId: user?.id, sessionId },
        params.productId,
        body.quantity
      );
      return "Quantity updated";
    },
    {
      params: t.Object({ productId: t.String() }),
      body: t.Object({ quantity: t.Integer() }),
      response: { 200: t.String() },
      detail: {
        summary: "Update item quantity",
      },
    }
  )

  .delete(
    "/items/:productId",
    async ({ user, sessionId, params }) => {
      await cartsService.removeItem({ userId: user?.id, sessionId }, params.productId);
      return status(204, null);
    },
    {
      params: t.Object({ productId: t.String() }),
      response: { 204: t.Null() },
      detail: {
        summary: "Remove item from cart",
      },
    }
  );
