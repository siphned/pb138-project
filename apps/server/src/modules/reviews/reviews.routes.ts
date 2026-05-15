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
          summary: "List product reviews",
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
        response: { 200: t.Any(), 400: errorResponse, 404: errorResponse },
      }
    )

    .get(
      "/winemakers/:id/reviews",
      async ({ params, query }) => {
        const { page = 1, limit = 10, sort = "newest" } = query;
        return reviewsService.listWinemakerReviews(params.id, { limit, page, sort });
      },
      {
        detail: {
          description: "Returns all reviews for a winemaker.",
          summary: "List winemaker reviews",
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
      }
    )

    .post(
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
          tags: ["reviews"],
        },
        params: t.Object({ id: t.String() }),
        requireAuth: true,
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
      }
    )

    .post(
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
          tags: ["reviews"],
        },
        params: t.Object({ id: t.String() }),
        requireAuth: true,
        response: { 200: t.Any(), 400: errorResponse, 404: errorResponse },
      }
    )

    .delete(
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
        query: t.Object({ entityId: t.String(), entityType: t.String() }),
        requireAuth: true,
        response: { 200: t.Any(), 403: errorResponse, 404: errorResponse },
      }
    );

export const reviewsRoutes = createReviewsRoutes();
