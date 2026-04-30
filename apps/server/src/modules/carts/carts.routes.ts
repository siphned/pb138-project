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
  createdAt: t.Date(),
  deletedAt: t.Union([t.Date(), t.Null()]),
  description: t.Union([t.String(), t.Null()]),
  id: t.String(),
  isBundle: t.Boolean(),
  name: t.String(),
  price: t.String(),
  quantity: t.Integer(),
  shopId: t.String(),
  updatedAt: t.Union([t.Date(), t.Null()]),
});

const cartItemResponse = t.Object({
  cartId: t.String(),
  createdAt: t.Date(),
  deletedAt: t.Union([t.Date(), t.Null()]),
  id: t.String(),
  product: productInCart,
  productId: t.String(),
  quantity: t.Integer(),
  updatedAt: t.Date(),
});

const cartResponse = t.Object({
  createdAt: t.Date(),
  deletedAt: t.Union([t.Date(), t.Null()]),
  id: t.String(),
  items: t.Array(cartItemResponse),
  sessionId: t.Union([t.String(), t.Null()]),
  updatedAt: t.Date(),
  userId: t.Union([t.String(), t.Null()]),
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
      response: { 200: t.Union([cartResponse, t.Null()]), 400: t.String() },
    }
  )

  .post(
    "/items",
    async ({ user, sessionId, body }) => {
      try {
        await cartsService.addItem({ sessionId, userId: user?.id }, body.productId, body.quantity);
        return status(201, "Item added");
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "PRODUCT_DELETED") {
          return status(410, "Product is no longer available");
        }
        throw e;
      }
    },
    {
      body: cartItemSchema,
      detail: {
        summary: "Add item to cart",
      },
      response: { 201: t.String(), 410: t.String() },
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
      body: t.Object({ quantity: t.Integer() }),
      detail: {
        summary: "Update item quantity",
      },
      params: t.Object({ productId: t.String() }),
      response: { 200: t.String() },
    }
  )

  .delete(
    "/items/:productId",
    async ({ user, sessionId, params }) => {
      await cartsService.removeItem({ sessionId, userId: user?.id }, params.productId);
      return status(204, null);
    },
    {
      detail: {
        summary: "Remove item from cart",
      },
      params: t.Object({ productId: t.String() }),
      response: { 204: t.Null() },
    }
  );
