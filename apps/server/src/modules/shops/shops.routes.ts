import { Elysia, status } from "elysia";
import { z } from "zod";
import { errorResponse } from "../../utils/error-plugin";
import { authPlugin } from "../auth";
import {
  createShopBody,
  shopFiltersQuery,
  shopListResponse,
  shopResponse,
  updateShopBody,
} from "./shops.schema";
import { shopsService } from "./shops.service";

const idParams = z.object({ id: z.string() });

export const shopsRoutes = new Elysia()
  .use(authPlugin)

  .get(
    "/shops",
    ({ query }) =>
      shopsService.listShops({
        city: query.city,
        limit: query.limit,
        ownerUserId: query.ownerUserId,
        page: query.page,
        q: query.q,
      }),
    {
      detail: {
        description:
          "Returns all non-deleted shops with their addresses. Filterable by q, city, ownerUserId.",
        summary: "List all shops",
        tags: ["shops"],
      },
      query: shopFiltersQuery,
      response: { 200: shopListResponse },
    }
  )

  .get("/shops/me", ({ dbUser }) => shopsService.listMyShops(dbUser.id), {
    detail: {
      description: "Returns all shops owned by the authenticated user.",
      security: [{ bearerAuth: [] }],
      summary: "List my shops",
      tags: ["shops"],
    },
    requireRoles: ["shop_owner"],
    response: { 200: z.array(shopResponse) },
  })

  .get("/shops/:id", ({ params }) => shopsService.getShop(params.id), {
    detail: {
      description: "Returns a single shop with address. 404 if not found or deleted.",
      summary: "Get shop by ID",
      tags: ["shops"],
    },
    params: idParams,
    response: { 200: shopResponse, 404: errorResponse },
  })

  .post(
    "/shops",
    async ({ dbUser, body }) => status(201, await shopsService.createShop(dbUser.id, body)),
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
      params: idParams,
      requireRoles: ["shop_owner"],
      response: {
        200: z.object({ success: z.boolean() }),
        403: errorResponse,
        404: errorResponse,
      },
    }
  )

  .patch(
    "/shops/:id",
    ({ params, dbUser, body }) => shopsService.updateShop(params.id, dbUser.id, body),
    {
      body: updateShopBody,
      detail: {
        description: "Update name, description, or address of own shop.",
        security: [{ bearerAuth: [] }],
        summary: "Update shop",
        tags: ["shops"],
      },
      params: idParams,
      requireRoles: ["shop_owner", "admin"],
      response: { 200: shopResponse, 403: errorResponse, 404: errorResponse },
    }
  );
