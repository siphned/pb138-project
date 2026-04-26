import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { createReviewBody, reviewListResponse, reviewResponse } from "./reviews.schema";
import { reviewsService } from "./reviews.service";

export const reviewsRoutes = new Elysia({ prefix: "/reviews", tags: ["reviews"] })
  .use(authPlugin)

  .get(
    "/product/:id",
    async ({ params }) => {
      return await reviewsService.listProductReviews(params.id);
    },
    {
      params: t.Object({ id: t.String() }),
      response: { 200: reviewListResponse },
      detail: {
        tags: ["reviews"],
        summary: "List product reviews",
        description: "Returns all reviews and average rating for a product.",
      },
    }
  )

  .get(
    "/winemaker/:id",
    async ({ params }) => {
      return await reviewsService.listWinemakerReviews(params.id);
    },
    {
      params: t.Object({ id: t.String() }),
      response: { 200: reviewListResponse },
      detail: {
        tags: ["reviews"],
        summary: "List winemaker reviews",
        description: "Returns all reviews and average rating for a winemaker.",
      },
    }
  )

  .post(
    "/product/:id",
    async ({ dbUser, params, body }) => {
      try {
        return await reviewsService.createProductReview(dbUser.id, params.id, body);
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === "NOT_PURCHASED")
            return status(403, "You must purchase the product to review it");
          if (e.message === "ALREADY_REVIEWED")
            return status(409, "You have already reviewed this product");
        }
        throw e;
      }
    },
    {
      requireAuth: true,
      params: t.Object({ id: t.String() }),
      body: createReviewBody,
      response: { 200: reviewResponse, 403: t.String(), 409: t.String() },
      detail: {
        tags: ["reviews"],
        summary: "Create product review",
        description: "Creates a review for a product. Requires verified purchase.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .post(
    "/winemaker/:id",
    async ({ dbUser, params, body }) => {
      try {
        return await reviewsService.createWinemakerReview(dbUser.id, params.id, body);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "ALREADY_REVIEWED")
          return status(409, "You have already reviewed this winemaker");
        throw e;
      }
    },
    {
      requireAuth: true,
      params: t.Object({ id: t.String() }),
      body: createReviewBody,
      response: { 200: reviewResponse, 409: t.String() },
      detail: {
        tags: ["reviews"],
        summary: "Create winemaker review",
        description: "Creates a review for a winemaker.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .delete(
    "/product/:id/:reviewId",
    async ({ dbUser, clerkPayload, params }) => {
      try {
        await reviewsService.deleteReview(
          params.reviewId,
          dbUser.id,
          clerkPayload.roles?.[0] ?? "user",
          params.id,
          "product"
        );
        return status(204, null);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND") return status(404, "Review not found");
        throw e;
      }
    },
    {
      requireAuth: true,
      params: t.Object({ id: t.String(), reviewId: t.String() }),
      response: { 204: t.Null(), 404: t.String() },
      detail: {
        tags: ["reviews"],
        summary: "Delete product review",
        description: "Soft-deletes a product review. Must be own review or admin.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .delete(
    "/winemaker/:id/:reviewId",
    async ({ dbUser, clerkPayload, params }) => {
      try {
        await reviewsService.deleteReview(
          params.reviewId,
          dbUser.id,
          clerkPayload.roles?.[0] ?? "user",
          params.id,
          "winemaker"
        );
        return status(204, null);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND") return status(404, "Review not found");
        throw e;
      }
    },
    {
      requireAuth: true,
      params: t.Object({ id: t.String(), reviewId: t.String() }),
      response: { 204: t.Null(), 404: t.String() },
      detail: {
        tags: ["reviews"],
        summary: "Delete winemaker review",
        description: "Soft-deletes a winemaker review. Must be own review or admin.",
        security: [{ bearerAuth: [] }],
      },
    }
  );
