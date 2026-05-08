import { Elysia, status, t } from "elysia";
import { errorResponse } from "../../utils/error-plugin";
import { authPlugin } from "../auth";
import {
  createBundleBody,
  createProductBody,
  getAllProductsQuery,
  getAllProductsResponse,
  updateBundleBody,
  updateProductBody,
} from "./products.schema";
import { productsService } from "./products.service";

export const productsRoutes = new Elysia({ prefix: "/products" })
  .use(authPlugin)

  .get("/", ({ query }) => productsService.getAllProducts(query), {
    detail: {
      description: "Returns all non-deleted products. Filterable by price, rating, type, etc.",
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
      query: t.Object({ isBundle: t.Optional(t.String()) }),
      response: { 200: t.Array(t.Any()), 404: errorResponse },
    }
  )

  .post(
    "/products",
    ({ params, dbUser, body }) => productsService.createProduct(params.id, dbUser.id, body),
    {
      body: createProductBody,
      detail: {
        description: "Creates a single wine product in a shop.",
        security: [{ bearerAuth: [] }],
        summary: "Create product",
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
      productsService.updateProduct(params.id, params.productId, dbUser.id, body),
    {
      body: updateProductBody,
      detail: {
        description: "Updates a single wine product.",
        security: [{ bearerAuth: [] }],
        summary: "Update product",
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
      await productsService.deleteProduct(params.id, params.productId, dbUser.id);
      return status(204, null);
    },
    {
      detail: {
        description: "Soft-deletes a product and reverts stock allocations.",
        security: [{ bearerAuth: [] }],
        summary: "Delete product",
        tags: ["products"],
      },
      params: t.Object({ id: t.String(), productId: t.String() }),
      requireRoles: ["shop_owner", "admin"],
      response: { 204: t.Null(), 403: errorResponse, 404: errorResponse },
    }
  )

  .post(
    "/bundles",
    ({ params, dbUser, body }) => productsService.createBundle(params.id, dbUser.id, body),
    {
      body: createBundleBody,
      detail: {
        description: "Creates a wine bundle in a shop.",
        security: [{ bearerAuth: [] }],
        summary: "Create bundle",
        tags: ["products"],
      },
      params: t.Object({ id: t.String() }),
      requireRoles: ["shop_owner", "admin"],
      response: { 201: t.Any(), 403: errorResponse, 404: errorResponse },
    }
  )

  .patch(
    "/bundles/:bundleId",
    ({ params, dbUser, body }) =>
      productsService.updateBundle(params.id, params.bundleId, dbUser.id, body),
    {
      body: updateBundleBody,
      detail: {
        description: "Updates a wine bundle.",
        security: [{ bearerAuth: [] }],
        summary: "Update bundle",
        tags: ["products"],
      },
      params: t.Object({ bundleId: t.String(), id: t.String() }),
      requireRoles: ["shop_owner", "admin"],
      response: { 200: t.Any(), 403: errorResponse, 404: errorResponse },
    }
  )

  .delete(
    "/bundles/:bundleId",
    async ({ params, dbUser }) => {
      await productsService.deleteBundle(params.id, params.bundleId, dbUser.id);
      return status(204, null);
    },
    {
      detail: {
        description: "Soft-deletes a bundle and reverts stock allocations.",
        security: [{ bearerAuth: [] }],
        summary: "Delete a bundle",
        tags: ["products"],
      },
      params: t.Object({ bundleId: t.String(), id: t.String() }),
      requireRoles: ["shop_owner", "admin"],
      response: { 204: t.Null(), 403: errorResponse, 404: errorResponse },
    }
  );
