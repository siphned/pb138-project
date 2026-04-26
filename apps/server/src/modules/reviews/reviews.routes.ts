import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { userRolesRepository } from "../users/user-roles.repository";
import { createReviewBody, reviewListResponse, reviewResponse } from "./reviews.schema";
import { reviewsService } from "./reviews.service";

export const reviewsRoutes = new Elysia()
  .use(authPlugin)

  .get("/products/:id/reviews", ({ params }) => reviewsService.listProductReviews(params.id), {
    params: t.Object({ id: t.String() }),
    response: { 200: reviewListResponse },
    detail: {
      tags: ["reviews"],
      summary: "List product reviews",
      description: "Returns all reviews for a product with average rating.",
    },
  })

  .post(
    "/products/:id/reviews",
    async ({ params, dbUser, body }) => {
      try {
        return status(201, await reviewsService.createProductReview(dbUser.id, params.id, body));
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === "NOT_PURCHASED")
            return status(403, "You have not purchased this product");
          if (e.message === "DUPLICATE_REVIEW")
            return status(409, "You have already reviewed this product");
        }
        throw e;
      }
    },
    {
      requireAuth: true,
      params: t.Object({ id: t.String() }),
      body: createReviewBody,
      response: { 201: reviewResponse, 403: t.String(), 409: t.String() },
      detail: {
        tags: ["reviews"],
        summary: "Create product review",
        description:
          "Creates a review for a product. Requires authentication and a completed purchase. One review per user per product.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .delete(
    "/products/:productId/reviews/:reviewId",
    async ({ params, dbUser }) => {
      try {
        const roles = await userRolesRepository.findByUserId(dbUser.id);
        await reviewsService.deleteProductReview(
          params.reviewId,
          params.productId,
          dbUser.id,
          roles
        );
        return status(204, null);
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === "NOT_FOUND") return status(404, "Review not found");
          if (e.message === "FORBIDDEN") return status(403, "You do not own this review");
        }
        throw e;
      }
    },
    {
      requireAuth: true,
      params: t.Object({ productId: t.String(), reviewId: t.String() }),
      response: { 204: t.Null(), 403: t.String(), 404: t.String() },
      detail: {
        tags: ["reviews"],
        summary: "Delete product review",
        description: "Soft-deletes a product review. Must be own review or admin.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .get("/winemakers/:id/reviews", ({ params }) => reviewsService.listWinemakerReviews(params.id), {
    params: t.Object({ id: t.String() }),
    response: { 200: reviewListResponse },
    detail: {
      tags: ["reviews"],
      summary: "List winemaker reviews",
      description: "Returns all reviews for a winemaker with average rating.",
    },
  })

  .post(
    "/winemakers/:id/reviews",
    async ({ params, dbUser, body }) => {
      try {
        return status(201, await reviewsService.createWinemakerReview(dbUser.id, params.id, body));
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === "DUPLICATE_REVIEW")
            return status(409, "You have already reviewed this winemaker");
        }
        throw e;
      }
    },
    {
      requireAuth: true,
      params: t.Object({ id: t.String() }),
      body: createReviewBody,
      response: { 201: reviewResponse, 409: t.String() },
      detail: {
        tags: ["reviews"],
        summary: "Create winemaker review",
        description:
          "Creates a review for a winemaker. Requires authentication. One review per user per winemaker.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .delete(
    "/winemakers/:winemakerId/reviews/:reviewId",
    async ({ params, dbUser }) => {
      try {
        const roles = await userRolesRepository.findByUserId(dbUser.id);
        await reviewsService.deleteWinemakerReview(
          params.reviewId,
          params.winemakerId,
          dbUser.id,
          roles
        );
        return status(204, null);
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === "NOT_FOUND") return status(404, "Review not found");
          if (e.message === "FORBIDDEN") return status(403, "You do not own this review");
        }
        throw e;
      }
    },
    {
      requireAuth: true,
      params: t.Object({ winemakerId: t.String(), reviewId: t.String() }),
      response: { 204: t.Null(), 403: t.String(), 404: t.String() },
      detail: {
        tags: ["reviews"],
        summary: "Delete winemaker review",
        description: "Soft-deletes a winemaker review. Must be own review or admin.",
        security: [{ bearerAuth: [] }],
      },
    }
  );
