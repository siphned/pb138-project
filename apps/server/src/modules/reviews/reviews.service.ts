import type { ReviewWithUser } from "./reviews.repository";
import { reviewsRepository } from "./reviews.repository";

type ReviewListResult<T> = { reviews: T[]; averageRating: number | null };

export const reviewsService = {
  async createProductReview(
    userId: string,
    productId: string,
    data: { rating: number; body?: string }
  ): Promise<ReviewWithUser> {
    const [hasPurchased, existing] = await Promise.all([
      reviewsRepository.hasPurchasedProduct(userId, productId),
      reviewsRepository.findUserReview(userId, productId, "product"),
    ]);

    if (!hasPurchased) throw new Error("NOT_PURCHASED");
    if (existing) throw new Error("ALREADY_REVIEWED");

    const review = await reviewsRepository.insertReview(userId, productId, "product", data);
    const withUser = await reviewsRepository.findReviewWithUser(review.id);
    if (!withUser) throw new Error("NOT_FOUND");
    return withUser;
  },

  async createWinemakerReview(
    userId: string,
    winemakerId: string,
    data: { rating: number; body?: string }
  ): Promise<ReviewWithUser> {
    const existing = await reviewsRepository.findUserReview(userId, winemakerId, "winemaker");
    if (existing) throw new Error("ALREADY_REVIEWED");

    const review = await reviewsRepository.insertReview(userId, winemakerId, "winemaker", data);
    const withUser = await reviewsRepository.findReviewWithUser(review.id);
    if (!withUser) throw new Error("NOT_FOUND");
    return withUser;
  },

  async deleteReview(
    reviewId: string,
    userId: string,
    userRole: string,
    entityId: string,
    entityType: "product" | "winemaker"
  ): Promise<void> {
    const review = await reviewsRepository.findUserReview(userId, entityId, entityType);
    if (!review || review.id !== reviewId) {
      // Also check by ID if it's admin
      if (userRole === "admin") {
        const byId = await reviewsRepository.findById(reviewId);
        if (!byId) throw new Error("NOT_FOUND");
      } else {
        throw new Error("NOT_FOUND");
      }
    }

    await reviewsRepository.softDelete(reviewId);
  },
  async listProductReviews(productId: string): Promise<ReviewListResult<ReviewWithUser>> {
    const [reviews, averageRating] = await Promise.all([
      reviewsRepository.findReviews(productId, "product"),
      reviewsRepository.averageRating(productId, "product"),
    ]);
    return { averageRating, reviews };
  },

  async listWinemakerReviews(winemakerId: string): Promise<ReviewListResult<ReviewWithUser>> {
    const [reviews, averageRating] = await Promise.all([
      reviewsRepository.findReviews(winemakerId, "winemaker"),
      reviewsRepository.averageRating(winemakerId, "winemaker"),
    ]);
    return { averageRating, reviews };
  },
};
