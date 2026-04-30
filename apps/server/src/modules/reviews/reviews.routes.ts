import { Elysia, t } from "elysia";
import { handleError } from "../../utils/errors";
import { authPlugin } from "../auth";
import {
  createReviewBody,
  listReviewsQuery,
  reviewListResponse,
  reviewResponse,
} from "./reviews.schema";
import { reviewsService } from "./reviews.service";

export const createReviewsRoutes = (auth = authPlugin) => {
  return new Elysia({ prefix: "/reviews", tags: ["reviews"] })
    .use(auth)

    .get(
      "/product/:id",
      async ({ params, query }) => {
        return await reviewsService.listProductReviews(params.id, {
          limit: query.limit ?? 12,
          page: query.page ?? 1,
          sort: query.sort ?? "newest",
        });
      },
      {
        detail: {
          description: "Returns paginated reviews and average rating for a product.",
          summary: "List product reviews",
          tags: ["reviews"],
        },
        params: t.Object({ id: t.String() }),
        query: listReviewsQuery,
        response: { 200: reviewListResponse },
      }
    )

    .get(
      "/winemaker/:id",
      async ({ params, query }) => {
        return await reviewsService.listWinemakerReviews(params.id, {
          limit: query.limit ?? 12,
          page: query.page ?? 1,
          sort: query.sort ?? "newest",
        });
      },
      {
        detail: {
          description: "Returns paginated reviews and average rating for a winemaker.",
          summary: "List winemaker reviews",
          tags: ["reviews"],
        },
        params: t.Object({ id: t.String() }),
        query: listReviewsQuery,
        response: { 200: reviewListResponse },
      }
    )

    .post(
      "/product/:id",
      // biome-ignore lint/suspicious/noExplicitAny: complex elysia type inference
      (async ({ dbUser, params, body }: any) => {
        try {
          return await reviewsService.createProductReview(dbUser.id, params.id, body);
        } catch (e: unknown) {
          return handleError(e);
        }
      }) as never,
      {
        body: createReviewBody,
        detail: {
          description: "Creates a review for a product. Requires verified purchase.",
          security: [{ bearerAuth: [] }],
          summary: "Create product review",
          tags: ["reviews"],
        },
        params: t.Object({ id: t.String() }),
        requireAuth: true,
        response: { 200: reviewResponse, 401: t.String(), 403: t.String(), 409: t.String() },
      }
    )

    .post(
      "/winemaker/:id",
      // biome-ignore lint/suspicious/noExplicitAny: complex elysia type inference
      (async ({ dbUser, params, body }: any) => {
        try {
          return await reviewsService.createWinemakerReview(dbUser.id, params.id, body);
        } catch (e: unknown) {
          return handleError(e);
        }
      }) as never,
      {
        body: createReviewBody,
        detail: {
          description: "Creates a review for a winemaker.",
          security: [{ bearerAuth: [] }],
          summary: "Create winemaker review",
          tags: ["reviews"],
        },
        params: t.Object({ id: t.String() }),
        requireAuth: true,
        response: { 200: reviewResponse, 401: t.String(), 409: t.String() },
      }
    )

    .delete(
      "/product/:id/:reviewId",
      // biome-ignore lint/suspicious/noExplicitAny: complex elysia type inference
      (async ({ dbUser, clerkPayload, params }: any) => {
        try {
          await reviewsService.deleteReview(
            params.reviewId,
            dbUser.id,
            clerkPayload?.roles?.[0] ?? "user",
            params.id,
            "product"
          );
          return { success: true };
        } catch (e: unknown) {
          return handleError(e);
        }
      }) as never,
      {
        detail: {
          description: "Soft-deletes a product review. Must be own review or admin.",
          security: [{ bearerAuth: [] }],
          summary: "Delete product review",
          tags: ["reviews"],
        },
        params: t.Object({ id: t.String(), reviewId: t.String() }),
        requireAuth: true,
        response: { 200: t.Object({ success: t.Boolean() }), 401: t.String(), 404: t.String() },
      }
    )

    .delete(
      "/winemaker/:id/:reviewId",
      // biome-ignore lint/suspicious/noExplicitAny: complex elysia type inference
      (async ({ dbUser, clerkPayload, params }: any) => {
        try {
          await reviewsService.deleteReview(
            params.reviewId,
            dbUser.id,
            clerkPayload?.roles?.[0] ?? "user",
            params.id,
            "winemaker"
          );
          return { success: true };
        } catch (e: unknown) {
          return handleError(e);
        }
      }) as never,
      {
        detail: {
          description: "Soft-deletes a winemaker review. Must be own review or admin.",
          security: [{ bearerAuth: [] }],
          summary: "Delete winemaker review",
          tags: ["reviews"],
        },
        params: t.Object({ id: t.String(), reviewId: t.String() }),
        requireAuth: true,
        response: { 200: t.Object({ success: t.Boolean() }), 401: t.String(), 404: t.String() },
      }
    );
};

export const reviewsRoutes = createReviewsRoutes();
