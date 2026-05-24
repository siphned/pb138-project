<<<<<<< HEAD
import { BadRequestError } from "@repo/shared";
import { Elysia, t } from "elysia";
import { errorResponse } from "../../utils/error-plugin";
import { authPlugin } from "../auth";
import { reviewsService } from "./reviews.service";

export const createReviewsRoutes = (auth = authPlugin) =>
  new Elysia()
    .use(auth)

    .get(
      "/products/:id/reviews",
      async ({ params, query }) => {
        const { page = 1, limit = 10, sort = "newest" } = query;
        return reviewsService.listProductReviews(params.id, { limit, page, sort });
      },
      {
        detail: {
          description: "Returns all reviews for a product with rating breakdown.",
=======
import { Elysia, t } from "elysia";
import { handleError } from "../../utils/errors";
import { authPlugin } from "../auth";
import { createReviewBody, reviewListResponse, reviewResponse } from "./reviews.schema";
import { reviewsService } from "./reviews.service";

export const createReviewsRoutes = (auth = authPlugin) => {
  return new Elysia({ prefix: "/reviews", tags: ["reviews"] })
    .use(auth)

    .get(
      "/product/:id",
      async ({ params }) => {
        return await reviewsService.listProductReviews(params.id);
      },
      {
        detail: {
          description: "Returns all reviews and average rating for a product.",
>>>>>>> origin/main
          summary: "List product reviews",
          tags: ["reviews"],
        },
        params: t.Object({ id: t.String() }),
<<<<<<< HEAD
        query: t.Object({
          limit: t.Optional(t.Numeric()),
          page: t.Optional(t.Numeric()),
          sort: t.Optional(
            t.Union([t.Literal("newest"), t.Literal("highest"), t.Literal("lowest")])
          ),
        }),
        response: { 200: t.Any() },
      }
    )

    .post(
      "/products/:id/reviews",
      ({ params, dbUser, body }) => reviewsService.createProductReview(dbUser.id, params.id, body),
      {
        body: t.Object({
          body: t.Optional(t.String()),
          rating: t.Numeric({ maximum: 5, minimum: 1 }),
        }),
        detail: {
          description: "Creates a review for a product. Must have purchased it.",
          security: [{ bearerAuth: [] }],
          summary: "Review product",
          tags: ["reviews"],
        },
        params: t.Object({ id: t.String() }),
        requireAuth: true,
        response: { 200: t.Any(), 400: errorResponse, 403: errorResponse, 404: errorResponse },
=======
        response: { 200: reviewListResponse },
>>>>>>> origin/main
      }
    )

    .get(
<<<<<<< HEAD
      "/winemakers/:id/reviews",
      async ({ params, query }) => {
        const { page = 1, limit = 10, sort = "newest" } = query;
        return reviewsService.listWinemakerReviews(params.id, { limit, page, sort });
      },
      {
        detail: {
          description: "Returns all reviews for a winemaker.",
=======
      "/winemaker/:id",
      async ({ params }) => {
        return await reviewsService.listWinemakerReviews(params.id);
      },
      {
        detail: {
          description: "Returns all reviews and average rating for a winemaker.",
>>>>>>> origin/main
          summary: "List winemaker reviews",
          tags: ["reviews"],
        },
        params: t.Object({ id: t.String() }),
<<<<<<< HEAD
        query: t.Object({
          limit: t.Optional(t.Numeric()),
          page: t.Optional(t.Numeric()),
          sort: t.Optional(
            t.Union([t.Literal("newest"), t.Literal("highest"), t.Literal("lowest")])
          ),
        }),
        response: { 200: t.Any() },
=======
        response: { 200: reviewListResponse },
>>>>>>> origin/main
      }
    )

    .post(
<<<<<<< HEAD
      "/winemakers/:id/reviews",
      ({ params, dbUser, body }) =>
        reviewsService.createWinemakerReview(dbUser.id, params.id, body),
      {
        body: t.Object({
          body: t.Optional(t.String()),
          rating: t.Numeric({ maximum: 5, minimum: 1 }),
        }),
        detail: {
          description: "Creates a review for a winemaker profile.",
          security: [{ bearerAuth: [] }],
          summary: "Review winemaker",
=======
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
>>>>>>> origin/main
          tags: ["reviews"],
        },
        params: t.Object({ id: t.String() }),
        requireAuth: true,
<<<<<<< HEAD
        response: { 200: t.Any(), 400: errorResponse, 403: errorResponse, 404: errorResponse },
      }
    )

    .get(
      "/wines/:id/reviews",
      async ({ params, query }) => {
        const { page = 1, limit = 10, sort = "newest" } = query;
        return reviewsService.listWineReviews(params.id, { limit, page, sort });
      },
      {
        detail: {
          description: "Returns all reviews for a wine.",
          summary: "List wine reviews",
          tags: ["reviews"],
        },
        params: t.Object({ id: t.String() }),
        query: t.Object({
          limit: t.Optional(t.Numeric()),
          page: t.Optional(t.Numeric()),
          sort: t.Optional(
            t.Union([t.Literal("newest"), t.Literal("highest"), t.Literal("lowest")])
          ),
        }),
        response: { 200: t.Any() },
=======
        response: { 200: reviewResponse, 401: t.String(), 403: t.String(), 409: t.String() },
>>>>>>> origin/main
      }
    )

    .post(
<<<<<<< HEAD
      "/wines/:id/reviews",
      ({ params, dbUser, body }) => reviewsService.createWineReview(dbUser.id, params.id, body),
      {
        body: t.Object({
          body: t.Optional(t.String()),
          rating: t.Numeric({ maximum: 5, minimum: 1 }),
        }),
        detail: {
          description: "Creates a review for a wine. Must have purchased a product with it.",
          security: [{ bearerAuth: [] }],
          summary: "Review wine",
=======
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
>>>>>>> origin/main
          tags: ["reviews"],
        },
        params: t.Object({ id: t.String() }),
        requireAuth: true,
<<<<<<< HEAD
        response: { 200: t.Any(), 400: errorResponse, 403: errorResponse, 404: errorResponse },
=======
        response: { 200: reviewResponse, 401: t.String(), 409: t.String() },
>>>>>>> origin/main
      }
    )

    .delete(
<<<<<<< HEAD
      "/reviews/:id",
      async ({ params, dbUser, clerkPayload, query }) => {
        const { entityId, entityType } = query;
        if (!entityId || !entityType)
          throw new BadRequestError("entityId and entityType are required", "BAD_REQUEST");
        await reviewsService.deleteReview(
          params.id,
          dbUser.id,
          clerkPayload.roles?.[0] ?? "customer",
          entityId,
          entityType as "product" | "winemaker" | "wine"
        );
        return { success: true };
      },
      {
        detail: {
          description: "Deletes a review. Must be owner or admin.",
          security: [{ bearerAuth: [] }],
          summary: "Delete review",
          tags: ["reviews"],
        },
        params: t.Object({ id: t.String() }),
        query: t.Object({
          entityId: t.String(),
          entityType: t.Union([t.Literal("product"), t.Literal("winemaker"), t.Literal("wine")]),
        }),
        requireAuth: true,
        response: { 200: t.Any(), 403: errorResponse, 404: errorResponse },
      }
    );
=======
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
>>>>>>> origin/main

export const reviewsRoutes = createReviewsRoutes();
