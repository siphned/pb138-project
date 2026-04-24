import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import {
  createBundleBody,
  createProductBody,
  updateBundleBody,
  updateProductBody,
} from "./products.schema";
import { productsService } from "./products.service";

const shopParams = t.Object({ id: t.String() });
const shopProductParams = t.Object({ id: t.String(), productId: t.String() });
const shopBundleParams = t.Object({ id: t.String(), bundleId: t.String() });

const bundleResponse = t.Object({
  id: t.String(),
  shopId: t.String(),
  name: t.String(),
  description: t.Nullable(t.String()),
  price: t.String(),
  quantity: t.Integer(),
  isBundle: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Nullable(t.Date()),
});

const productResponse = t.Object({
  id: t.String(),
  shopId: t.String(),
  name: t.String(),
  description: t.Nullable(t.String()),
  price: t.String(),
  quantity: t.Integer(),
  isBundle: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Nullable(t.Date()),
});

function handleError(e: unknown) {
  if (e instanceof Error) {
    if (e.message === "NOT_FOUND") return status(404, "Not found");
    if (e.message === "FORBIDDEN") return status(403, "Forbidden");
    if (e.message === "INVALID_WINE") return status(422, "One or more wine IDs are invalid");
    if (e.message === "BUNDLE_MIN_WINES") return status(422, "Bundle requires at least 2 wines");
  }
  throw e;
}

export const productsRoutes = new Elysia()
  .use(authPlugin)

  // ── Products ──────────────────────────────────────────────────────────────

  .get(
    "/shops/:id/products",
    async ({ params, query }) => {
      const isBundle =
        query.isBundle === "true" ? true : query.isBundle === "false" ? false : undefined;
      try {
        return await productsService.listProducts(params.id, isBundle);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      params: shopParams,
      query: t.Object({ isBundle: t.Optional(t.String()) }),
      detail: {
        tags: ["products"],
        summary: "List products for a shop",
        description:
          "Returns products and bundles for the shop. Filter with `?isBundle=true` or `?isBundle=false`.",
      },
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
      params: t.Object({ id: t.String() }),
      detail: {
        tags: ["products"],
        summary: "Get product or bundle by ID",
      },
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
      requireCapability: "shop_owner",
      params: shopParams,
      body: createProductBody,
      detail: {
        tags: ["products"],
        summary: "Create a product",
        security: [{ bearerAuth: [] }],
      },
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
      requireAuth: true,
      params: shopProductParams,
      body: updateProductBody,
      detail: {
        tags: ["products"],
        summary: "Update a product",
        security: [{ bearerAuth: [] }],
      },
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
      requireAuth: true,
      params: shopProductParams,
      detail: {
        tags: ["products"],
        summary: "Delete a product",
        security: [{ bearerAuth: [] }],
      },
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
      requireCapability: "shop_owner",
      params: shopParams,
      body: createBundleBody,
      detail: {
        tags: ["products"],
        summary: "Create a bundle",
        security: [{ bearerAuth: [] }],
      },
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
      requireAuth: true,
      params: shopBundleParams,
      body: updateBundleBody,
      response: { 200: bundleResponse, 403: t.String(), 404: t.String(), 422: t.String() },
      detail: {
        tags: ["products"],
        summary: "Update a bundle",
        security: [{ bearerAuth: [] }],
      },
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
      requireAuth: true,
      params: shopBundleParams,
      detail: {
        tags: ["products"],
        summary: "Delete a bundle",
        security: [{ bearerAuth: [] }],
      },
    }
  );
