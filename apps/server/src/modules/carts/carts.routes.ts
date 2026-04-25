import { Elysia, status, t } from "elysia";
import { handleError } from "../../utils/errors";
import { authPlugin } from "../auth";
import { addItemBody, cartResponse, mergeBody, updateItemBody } from "./carts.schema";
import { cartsService } from "./carts.service";

const errorResponses = { 400: t.String(), 403: t.String(), 404: t.String(), 409: t.String() };

export const cartsRoutes = new Elysia()
  .use(authPlugin)

  .get("/carts/me", async ({ dbUser }) => cartsService.getMyCart(dbUser.id), {
    requireAuth: true,
    response: { 200: cartResponse },
    detail: {
      tags: ["carts"],
      summary: "Get current user's cart",
      security: [{ bearerAuth: [] }],
    },
  })

  .post(
    "/carts/items",
    async ({ dbUser, body }) => {
      try {
        return status(201, await cartsService.addItem(dbUser.id, body.productId, body.quantity));
      } catch (e) {
        return handleError(e);
      }
    },
    {
      requireAuth: true,
      body: addItemBody,
      response: { 201: cartResponse, ...errorResponses },
      detail: {
        tags: ["carts"],
        summary: "Add item to cart",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .put(
    "/carts/items/:id",
    async ({ dbUser, params, body }) => {
      try {
        return await cartsService.updateItem(dbUser.id, params.id, body.quantity);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      requireAuth: true,
      params: t.Object({ id: t.String() }),
      body: updateItemBody,
      response: { 200: cartResponse, ...errorResponses },
      detail: {
        tags: ["carts"],
        summary: "Update cart item quantity",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .delete(
    "/carts/items/:id",
    async ({ dbUser, params }) => {
      try {
        await cartsService.removeItem(dbUser.id, params.id);
        return status(204, null);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      requireAuth: true,
      params: t.Object({ id: t.String() }),
      response: { 204: t.Null(), ...errorResponses },
      detail: {
        tags: ["carts"],
        summary: "Remove item from cart",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .post(
    "/carts/merge",
    async ({ dbUser, body }) => {
      try {
        return await cartsService.mergeGuestItems(dbUser.id, body.items);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      requireAuth: true,
      body: mergeBody,
      response: { 200: cartResponse, ...errorResponses },
      detail: {
        tags: ["carts"],
        summary: "Merge guest cart items into user cart (DB wins on conflict)",
        security: [{ bearerAuth: [] }],
      },
    }
  );
