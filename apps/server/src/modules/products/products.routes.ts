import { Elysia, status, t } from "elysia";
import { errorResponse } from "../../utils/error-plugin";
import { authPlugin } from "../auth";
import {
  createProductOrBundleBody,
  getAllProductsQuery,
  getAllProductsResponse,
  updateProductOrBundleBody,
} from "./products.schema";
import { productsService } from "./products.service";

export const productsRoutes = new Elysia({ prefix: "/products" })
  .use(authPlugin)

  .get("/", ({ query }) => productsService.getAllProducts(query), {
    detail: {
      description:
        "Returns all non-deleted products. Filterable by shopId, isBundle, q, price, rating, type, etc.",
      summary: "List all products (catalog)",
      tags: ["products"],
    },
    query: getAllProductsQuery,
    response: { 200: getAllProductsResponse },
  })

  .get("/:id", ({ params }) => productsService.getProduct(params.id), {
    detail: {
      description: "Returns a single product with its underlying wines.",
      summary: "Get product by ID",
      tags: ["products"],
    },
    params: t.Object({ id: t.String() }),
    response: { 200: t.Any(), 404: errorResponse },
  });

export const shopProductsRoutes = new Elysia({ prefix: "/shops/:id" })
  .use(authPlugin)

  .get(
    "/products",
    ({ params, query }) => productsService.listProducts(params.id, query.isBundle === "true"),
    {
      detail: {
        description: "Returns all products belonging to a specific shop.",
        summary: "List shop products",
        tags: ["products"],
      },
      params: t.Object({ id: t.String() }),
      query: t.Object({
        isBundle: t.Optional(t.Union([t.Literal("true"), t.Literal("false")])),
      }),
      response: { 200: t.Array(t.Any()), 404: errorResponse },
    }
  )

  .post(
    "/products",
    async ({ params, dbUser, body }) =>
      status(201, await productsService.createProductOrBundle(params.id, dbUser.id, body)),
    {
      body: createProductOrBundleBody,
      detail: {
        description:
          "Creates a product (wineId) or bundle (wines array with ≥2 entries) in a shop.",
        security: [{ bearerAuth: [] }],
        summary: "Create product or bundle",
        tags: ["products"],
      },
      params: t.Object({ id: t.String() }),
      requireRoles: ["shop_owner", "admin"],
      response: { 201: t.Any(), 403: errorResponse, 404: errorResponse },
    }
  )

  .patch(
    "/products/:productId",
    ({ params, dbUser, body }) =>
      productsService.updateProductOrBundle(params.id, params.productId, dbUser.id, body),
    {
      body: updateProductOrBundleBody,
      detail: {
        description: "Updates a product or bundle. Supplying wines on a non-bundle returns 422.",
        security: [{ bearerAuth: [] }],
        summary: "Update product or bundle",
        tags: ["products"],
      },
      params: t.Object({ id: t.String(), productId: t.String() }),
      requireRoles: ["shop_owner", "admin"],
      response: { 200: t.Any(), 403: errorResponse, 404: errorResponse },
    }
  )

  .delete(
    "/products/:productId",
    async ({ params, dbUser }) => {
      await productsService.deleteProductOrBundle(params.id, params.productId, dbUser.id);
      return status(204, null);
    },
    {
      detail: {
        description: "Soft-deletes a product or bundle and reverts stock allocations.",
        security: [{ bearerAuth: [] }],
        summary: "Delete product or bundle",
        tags: ["products"],
      },
      params: t.Object({ id: t.String(), productId: t.String() }),
      requireRoles: ["shop_owner", "admin"],
      response: { 204: t.Null(), 403: errorResponse, 404: errorResponse },
    }
  );
