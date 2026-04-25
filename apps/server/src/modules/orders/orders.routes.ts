import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { checkoutBody, updateItemStatusBody } from "./orders.schema";
import { ordersService } from "./orders.service";

function handleError(e: unknown) {
  if (e instanceof Error) {
    if (e.message === "NOT_FOUND") return status(404, "Not found");
    if (e.message === "FORBIDDEN") return status(403, "Forbidden");
    if (e.message === "CART_EMPTY") return status(400, "Cart is empty");
    if (e.message === "MISSING_SHIPPING_ADDRESS")
      return status(400, "Shipping address is required");
    if (e.message === "MISSING_BILLING_ADDRESS") return status(400, "Billing address is required");
  }
  throw e;
}

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
      detail: {
        tags: ["orders"],
        summary: "Checkout — convert cart to order",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .get("/orders", async ({ dbUser }) => ordersService.getMyOrders(dbUser.id), {
    requireAuth: true,
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
      detail: {
        tags: ["orders"],
        summary: "Update order item status (shop owner only)",
        security: [{ bearerAuth: [] }],
      },
    }
  );
