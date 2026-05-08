import { db } from "../../db";
import { parsePagination } from "../../utils/pagination";
import type { ReviewWithUser } from "./reviews.repository";
import * as reviewsRepo from "./reviews.repository";

type ReviewListResult<T> = { reviews: T[]; averageRating: number | null; totalCount: number };

export class ReviewsService {
  async createProductReview(
    userId: string,
    productId: string,
    data: { rating: number; body?: string }
  ): Promise<ReviewWithUser> {
    const [hasPurchased, existing] = await Promise.all([
      reviewsRepo.hasPurchasedProduct(db, userId, productId),
      reviewsRepo.findUserReview(db, userId, productId, "product"),
    ]);

    if (!hasPurchased) throw new Error("NOT_PURCHASED");
    if (existing) throw new Error("ALREADY_REVIEWED");

    const review = await reviewsRepo.insertReview(db, userId, productId, "product", data);
    const withUser = await reviewsRepo.findReviewWithUser(db, review.id);
    if (!withUser) throw new Error("NOT_FOUND");
    return withUser;
  }

  async createWinemakerReview(
    userId: string,
    winemakerId: string,
    data: { rating: number; body?: string }
  ): Promise<ReviewWithUser> {
    const existing = await reviewsRepo.findUserReview(db, userId, winemakerId, "winemaker");
    if (existing) throw new Error("ALREADY_REVIEWED");

    const review = await reviewsRepo.insertReview(db, userId, winemakerId, "winemaker", data);
    const withUser = await reviewsRepo.findReviewWithUser(db, review.id);
    if (!withUser) throw new Error("NOT_FOUND");
    return withUser;
  }

  async createWineReview(
    userId: string,
    wineId: string,
    data: { rating: number; body?: string }
  ): Promise<ReviewWithUser> {
    const [hasPurchased, existing] = await Promise.all([
      reviewsRepo.hasPurchasedWine(db, userId, wineId),
      reviewsRepo.findUserReview(db, userId, wineId, "wine"),
    ]);

    if (!hasPurchased) throw new Error("NOT_PURCHASED");
    if (existing) throw new Error("ALREADY_REVIEWED");

    const review = await reviewsRepo.insertReview(db, userId, wineId, "wine", data);
    const withUser = await reviewsRepo.findReviewWithUser(db, review.id);
    if (!withUser) throw new Error("NOT_FOUND");
    return withUser;
  }

  async deleteReview(
    reviewId: string,
    userId: string,
    userRole: string,
    entityId: string,
    entityType: "product" | "winemaker" | "wine"
  ): Promise<void> {
    const review = await reviewsRepo.findUserReview(db, userId, entityId, entityType);
    if (!review || review.id !== reviewId) {
      // Also check by ID if it's admin
      if (userRole === "admin") {
        const byId = await reviewsRepo.findById(db, reviewId);
        if (!byId) throw new Error("NOT_FOUND");
      } else {
        throw new Error("NOT_FOUND");
      }
    }

    await reviewsRepo.softDelete(db, reviewId);
  }

  async listProductReviews(
    productId: string,
    opts: { page: number; limit: number; sort: "newest" | "highest" | "lowest" }
  ): Promise<ReviewListResult<ReviewWithUser>> {
    const { limit, offset } = parsePagination(opts);
    const [reviews, totalCount, averageRating] = await Promise.all([
      reviewsRepo.findReviews(db, productId, "product", { limit, offset, sort: opts.sort }),
      reviewsRepo.countReviews(db, productId, "product"),
      reviewsRepo.averageRating(db, productId, "product"),
    ]);
    return { averageRating, reviews, totalCount };
  }

  async listWinemakerReviews(
    winemakerId: string,
    opts: { page: number; limit: number; sort: "newest" | "highest" | "lowest" }
  ): Promise<ReviewListResult<ReviewWithUser>> {
    const { limit, offset } = parsePagination(opts);
    const [reviews, totalCount, averageRating] = await Promise.all([
      reviewsRepo.findReviews(db, winemakerId, "winemaker", { limit, offset, sort: opts.sort }),
      reviewsRepo.countReviews(db, winemakerId, "winemaker"),
      reviewsRepo.averageRating(db, winemakerId, "winemaker"),
    ]);
    return { averageRating, reviews, totalCount };
  }

  async listWineReviews(
    wineId: string,
    opts: { page: number; limit: number; sort: "newest" | "highest" | "lowest" }
  ): Promise<ReviewListResult<ReviewWithUser>> {
    const { limit, offset } = parsePagination(opts);
    const [reviews, totalCount, averageRating] = await Promise.all([
      reviewsRepo.findReviews(db, wineId, "wine", { limit, offset, sort: opts.sort }),
      reviewsRepo.countReviews(db, wineId, "wine"),
      reviewsRepo.averageRating(db, wineId, "wine"),
    ]);
    return { averageRating, reviews, totalCount };
  }
}

export const reviewsService = new ReviewsService();
