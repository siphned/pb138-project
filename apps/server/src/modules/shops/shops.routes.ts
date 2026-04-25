import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { createShopBody, shopResponse, updateShopBody } from "./shops.schema";
import { shopsService } from "./shops.service";

export const shopsRoutes = new Elysia()
  .use(authPlugin)

  .get("/shops", () => shopsService.listShops(), {
    response: { 200: t.Array(shopResponse) },
    detail: {
      tags: ["shops"],
      summary: "List all shops",
      description: "Returns all non-deleted shops with their addresses.",
    },
  })

  .get("/shops/me", ({ dbUser }) => shopsService.listMyShops(dbUser.id), {
    requireRoles: ["shop_owner"],
    response: { 200: t.Array(shopResponse) },
    detail: {
      tags: ["shops"],
      summary: "List my shops",
      description: "Returns all shops owned by the authenticated user.",
      security: [{ bearerAuth: [] }],
    },
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
      params: t.Object({ id: t.String() }),
      response: { 200: shopResponse, 404: t.String() },
      detail: {
        tags: ["shops"],
        summary: "Get shop by ID",
        description: "Returns a single shop with address. 404 if not found or deleted.",
      },
    }
  )

  .post(
    "/shops",
    async ({ dbUser, body }) => {
      return status(201, await shopsService.createShop(dbUser.id, body));
    },
    {
      requireRoles: ["shop_owner"],
      body: createShopBody,
      response: { 201: shopResponse },
      detail: {
        tags: ["shops"],
        summary: "Create a shop",
        description: "Creates a new shop for the authenticated shop owner.",
        security: [{ bearerAuth: [] }],
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
      requireRoles: ["shop_owner", "admin"],
      params: t.Object({ id: t.String() }),
      body: updateShopBody,
      response: { 200: shopResponse, 403: t.String(), 404: t.String() },
      detail: {
        tags: ["shops"],
        summary: "Update shop",
        description: "Update name, description, or address of own shop.",
        security: [{ bearerAuth: [] }],
      },
    }
  );
