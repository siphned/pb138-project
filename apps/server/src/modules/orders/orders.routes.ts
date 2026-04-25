import { Elysia, status, t } from "elysia";
import { handleError } from "../../utils/errors";
import { authPlugin } from "../auth";
import { checkoutBody, orderResponse, updateItemStatusBody } from "./orders.schema";
import { ordersService } from "./orders.service";

const errorResponses = { 400: t.String(), 403: t.String(), 404: t.String(), 409: t.String() };

export const ordersRoutes = new Elysia()
  .use(authPlugin)

  .post(
    "/orders",
    async ({ dbUser, body }) => {
      try {
        return status(201, await ordersService.checkout(dbUser.id, body));
      } catch (e) {
        return handleError(e);
      }
    },
    {
      requireAuth: true,
      body: checkoutBody,
      response: { 201: orderResponse, ...errorResponses },
      detail: {
        tags: ["orders"],
        summary: "Checkout — convert cart to order",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .get("/orders", async ({ dbUser }) => ordersService.getMyOrders(dbUser.id), {
    requireAuth: true,
    response: { 200: t.Array(orderResponse) },
    detail: {
      tags: ["orders"],
      summary: "List current user's orders",
      security: [{ bearerAuth: [] }],
    },
  })

  .get(
    "/orders/:id",
    async ({ dbUser, params }) => {
      try {
        return await ordersService.getOrderById(dbUser.id, params.id);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      requireAuth: true,
      params: t.Object({ id: t.String() }),
      response: { 200: orderResponse, ...errorResponses },
      detail: {
        tags: ["orders"],
        summary: "Get order by ID (own orders only)",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .put(
    "/orders/:id/items/:itemId/status",
    async ({ dbUser, params, body }) => {
      try {
        return await ordersService.updateOrderItemStatus(
          dbUser.id,
          params.id,
          params.itemId,
          body.status
        );
      } catch (e) {
        return handleError(e);
      }
    },
    {
      requireCapability: "shop_owner",
      params: t.Object({ id: t.String(), itemId: t.String() }),
      body: updateItemStatusBody,
      response: { 200: orderResponse, ...errorResponses },
      detail: {
        tags: ["orders"],
        summary: "Update order item status (shop owner only)",
        security: [{ bearerAuth: [] }],
      },
    }
  );
