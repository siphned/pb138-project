import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { verifyClerkToken } from "../auth/auth.utils";
import { usersService } from "../users/users.service";
import { cartsService } from "./carts.service";

const cartItemSchema = t.Object({
  productId: t.String(),
  quantity: t.Integer(),
});

export const cartsRoutes = new Elysia({ prefix: "/carts", tags: ["carts"] })
  .use(authPlugin)
  .derive(async ({ headers, cookie: { guest_session_id } }) => {
    const payload = await verifyClerkToken(headers.authorization);
    if (payload) {
      const dbUser = await usersService.lazyGetOrCreate(payload.sub, payload);
      return { user: dbUser, sessionId: undefined as string | undefined };
    }
    return { user: undefined, sessionId: guest_session_id?.value as string | undefined };
  })

  .get("/", async ({ user, sessionId }) => {
    if (user) return await cartsService.getCartForUser(user.id);
    if (sessionId) return await cartsService.getCartForSession(sessionId);
    return status(400, "No user or session found");
  })

  .post(
    "/items",
    async ({ user, sessionId, body }) => {
      await cartsService.addItem({ userId: user?.id, sessionId }, body.productId, body.quantity);
      return status(201, "Item added");
    },
    {
      body: cartItemSchema,
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
    }
  )

  .delete("/items/:productId", async ({ user, sessionId, params }) => {
    await cartsService.removeItem({ userId: user?.id, sessionId }, params.productId);
    return status(204, null);
  });
