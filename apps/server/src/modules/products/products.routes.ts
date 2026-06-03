import { Elysia, status } from "elysia";
import { z } from "zod";
import { errorResponse } from "../../utils/error-plugin";
import { authPlugin } from "../auth";
import {
  createProductOrBundleBody,
  getAllProductsQuery,
  getAllProductsResponse,
  updateProductOrBundleBody,
} from "./products.schema";
import { productsService } from "./products.service";

const idParams = z.object({ id: z.string() });
const shopProductParams = z.object({ id: z.string(), productId: z.string() });

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
    params: idParams,
    response: { 200: z.any(), 404: errorResponse },
  });

export const shopProductsRoutes = new Elysia({ prefix: "/shops/:id" })
  .use(authPlugin)

  .get(
    "/products",
    ({ params, query }) => productsService.getAllProducts({ ...query, shopId: params.id }),
    {
      detail: {
        description: "Returns all products belonging to a specific shop.",
        summary: "List shop products",
        tags: ["products"],
      },
      params: idParams,
      query: getAllProductsQuery,
      response: { 200: getAllProductsResponse, 404: errorResponse },
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
      params: idParams,
      requireRoles: ["shop_owner", "admin"],
      response: { 201: z.any(), 403: errorResponse, 404: errorResponse },
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
      params: shopProductParams,
      requireRoles: ["shop_owner", "admin"],
      response: { 200: z.any(), 403: errorResponse, 404: errorResponse },
    }
  )

  .delete(
    "/products/:productId",
    async ({ params, dbUser }) => {
      await productsService.deleteProductOrBundle(params.id, params.productId, dbUser.id);
      return status(204, "");
    },
    {
      detail: {
        description: "Soft-deletes a product or bundle and reverts stock allocations.",
        security: [{ bearerAuth: [] }],
        summary: "Delete product or bundle",
        tags: ["products"],
      },
      params: shopProductParams,
      requireRoles: ["shop_owner", "admin"],
      response: { 204: z.null(), 403: errorResponse, 404: errorResponse },
    }
  );
