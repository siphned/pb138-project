import { Elysia, status, t } from "elysia";
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

const shopParams = t.Object({ id: t.String() });
const shopProductParams = t.Object({ id: t.String(), productId: t.String() });
const shopBundleParams = t.Object({ bundleId: t.String(), id: t.String() });

const bundleResponse = t.Object({
  createdAt: t.Date(),
  description: t.Union([t.String(), t.Null()]),
  id: t.String(),
  isBundle: t.Boolean(),
  name: t.String(),
  price: t.String(),
  quantity: t.Integer(),
  shopId: t.String(),
  updatedAt: t.Union([t.Date(), t.Null()]),
});

function handleError(e: unknown) {
  if (e instanceof Error) {
    if (e.message === "NOT_FOUND") return status(404, "Not found");
    if (e.message === "FORBIDDEN") return status(403, "Forbidden");
    if (e.message === "INVALID_WINE") return status(422, "One or more wine IDs are invalid");
    if (e.message === "BUNDLE_MIN_WINES") return status(422, "Bundle requires at least 2 wines");
    if (e.message === "NOT_ENOUGH_STOCK")
      return status(422, "Not enough winemaker stock available");
  }
  throw e;
}

export const productsRoutes = new Elysia()
  .use(authPlugin)

  // ── Products ──────────────────────────────────────────────────────────────

  .get(
    "/shops/:id/products",
    async ({ params, query }) => {
      let isBundle: boolean | undefined;
      if (query.isBundle === "true") {
        isBundle = true;
      } else if (query.isBundle === "false") {
        isBundle = false;
      }
      try {
        return await productsService.listProducts(params.id, isBundle);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      detail: {
        description:
          "Returns products and bundles for the shop. Filter with `?isBundle=true` or `?isBundle=false`.",
        summary: "List products for a shop",
        tags: ["products"],
      },
      params: shopParams,
      query: t.Object({ isBundle: t.Optional(t.String()) }),
    }
  )

  .get(
    "/products",
    async ({ query }) => {
      try {
        return await productsService.getAllProducts(query);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      detail: {
        description:
          "Returns paginated retail products across all shops. Supports filtering by price, type, color, region, rating, and full-text search.",
        summary: "Browse product catalog",
        tags: ["products"],
      },
      query: getAllProductsQuery,
      response: { 200: getAllProductsResponse },
    }
  )

  .get(
    "/products/:id",
    async ({ params }) => {
      try {
        return await productsService.getProduct(params.id);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      detail: {
        summary: "Get product or bundle by ID",
        tags: ["products"],
      },
      params: t.Object({ id: t.String() }),
    }
  )

  .post(
    "/shops/:id/products",
    async ({ params, dbUser, body }) => {
      try {
        return status(201, await productsService.createProduct(params.id, dbUser.id, body));
      } catch (e) {
        return handleError(e);
      }
    },
    {
      body: createProductBody,
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Create a product",
        tags: ["products"],
      },
      params: shopParams,
      requireRoles: ["shop_owner"],
      response: { 201: bundleResponse, 403: t.String(), 404: t.String(), 422: t.String() },
    }
  )

  .patch(
    "/shops/:id/products/:productId",
    async ({ params, dbUser, body }) => {
      try {
        return await productsService.updateProduct(params.id, params.productId, dbUser.id, body);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      body: updateProductBody,
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Update a product",
        tags: ["products"],
      },
      params: shopProductParams,
      requireAuth: true,
      response: { 200: bundleResponse, 403: t.String(), 404: t.String(), 422: t.String() },
    }
  )

  .delete(
    "/shops/:id/products/:productId",
    async ({ params, dbUser }) => {
      try {
        await productsService.deleteProduct(params.id, params.productId, dbUser.id);
        return status(204, null);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Delete a product",
        tags: ["products"],
      },
      params: shopProductParams,
      requireAuth: true,
      response: { 204: t.Null(), 403: t.String(), 404: t.String() },
    }
  )

  // ── Bundles ───────────────────────────────────────────────────────────────

  .post(
    "/shops/:id/bundles",
    async ({ params, dbUser, body }) => {
      try {
        return status(201, await productsService.createBundle(params.id, dbUser.id, body));
      } catch (e) {
        return handleError(e);
      }
    },
    {
      body: createBundleBody,
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Create a bundle",
        tags: ["products"],
      },
      params: shopParams,
      requireRoles: ["shop_owner"],
      response: { 201: bundleResponse, 403: t.String(), 404: t.String(), 422: t.String() },
    }
  )

  .patch(
    "/shops/:id/bundles/:bundleId",
    async ({ params, dbUser, body }) => {
      try {
        return await productsService.updateBundle(params.id, params.bundleId, dbUser.id, body);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      body: updateBundleBody,
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Update a bundle",
        tags: ["products"],
      },
      params: shopBundleParams,
      requireAuth: true,
      response: { 200: bundleResponse, 403: t.String(), 404: t.String(), 422: t.String() },
    }
  )

  .delete(
    "/shops/:id/bundles/:bundleId",
    async ({ params, dbUser }) => {
      try {
        await productsService.deleteBundle(params.id, params.bundleId, dbUser.id);
        return status(204, null);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Delete a bundle",
        tags: ["products"],
      },
      params: shopBundleParams,
      requireAuth: true,
      response: { 204: t.Null(), 403: t.String(), 404: t.String() },
    }
  );
