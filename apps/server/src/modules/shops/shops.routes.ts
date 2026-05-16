import { Elysia, status, t } from "elysia";
import { errorResponse } from "../../utils/error-plugin";
import { authPlugin } from "../auth";
import { createShopBody, shopFiltersQuery, shopResponse, updateShopBody } from "./shops.schema";
import { shopsService } from "./shops.service";

export const shopsRoutes = new Elysia()
  .use(authPlugin)

  .get("/shops", ({ query }) => shopsService.listShops(query), {
    detail: {
      description:
        "Returns all non-deleted shops with their addresses. Filterable by q, city, ownerUserId.",
      summary: "List all shops",
      tags: ["shops"],
    },
    query: shopFiltersQuery,
    response: { 200: t.Array(shopResponse) },
  })

  .get("/shops/me", ({ dbUser }) => shopsService.listMyShops(dbUser.id), {
    detail: {
      description: "Returns all shops owned by the authenticated user.",
      security: [{ bearerAuth: [] }],
      summary: "List my shops",
      tags: ["shops"],
    },
    requireRoles: ["shop_owner"],
    response: { 200: t.Array(shopResponse) },
  })

  .get(
    "/shops/:id",
    async ({ params }) => {
      try {
        return await shopsService.getShop(params.id);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND") return status(404, "Shop not found");
        throw e;
      }
    },
    {
      detail: {
        description: "Returns a single shop with address. 404 if not found or deleted.",
        summary: "Get shop by ID",
        tags: ["shops"],
      },
      params: t.Object({ id: t.String() }),
      response: { 200: shopResponse, 404: t.String() },
    }
  )

  .post(
    "/shops",
    async ({ dbUser, body }) => {
      return status(201, await shopsService.createShop(dbUser.id, body));
    },
    {
      body: createShopBody,
      detail: {
        description: "Creates a new shop for the authenticated shop owner.",
        security: [{ bearerAuth: [] }],
        summary: "Create a shop",
        tags: ["shops"],
      },
      requireRoles: ["shop_owner"],
      response: { 201: shopResponse },
    }
  )

  .delete(
    "/shops/:id",
    async ({ params, dbUser }) => {
      await shopsService.deleteShop(params.id, dbUser.id);
      return { success: true };
    },
    {
      detail: {
        description: "Soft-delete own shop.",
        security: [{ bearerAuth: [] }],
        summary: "Delete shop",
        tags: ["shops"],
      },
      params: t.Object({ id: t.String() }),
      requireRoles: ["shop_owner"],
      response: {
        200: t.Object({ success: t.Boolean() }),
        403: errorResponse,
        404: errorResponse,
      },
    }
  )

  .patch(
    "/shops/:id",
    async ({ params, dbUser, body }) => {
      try {
        return await shopsService.updateShop(params.id, dbUser.id, body);
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === "NOT_FOUND") return status(404, "Shop not found");
          if (e.message === "FORBIDDEN") return status(403, "You do not own this shop");
        }
        throw e;
      }
    },
    {
      body: updateShopBody,
      detail: {
        description: "Update name, description, or address of own shop.",
        security: [{ bearerAuth: [] }],
        summary: "Update shop",
        tags: ["shops"],
      },
      params: t.Object({ id: t.String() }),
      requireRoles: ["shop_owner", "admin"],
      response: { 200: shopResponse, 403: t.String(), 404: t.String() },
    }
  );
