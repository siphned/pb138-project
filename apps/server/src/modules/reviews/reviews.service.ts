import { reviewsRepository } from "./reviews.repository";
import type { ProductReviewWithUser, WinemakerReviewWithUser } from "./reviews.repository";

type ReviewListResult<T> = { reviews: T[]; averageRating: number | null };
type ReviewData = { rating: number; body?: string };

export const reviewsService = {
  async listProductReviews(productId: string): Promise<ReviewListResult<ProductReviewWithUser>> {
    const [reviews, averageRating] = await Promise.all([
      reviewsRepository.findProductReviews(productId),
      reviewsRepository.averageProductRating(productId),
    ]);
    return { reviews, averageRating };
  },

  async listWinemakerReviews(
    winemakerId: string
  ): Promise<ReviewListResult<WinemakerReviewWithUser>> {
    const [reviews, averageRating] = await Promise.all([
      reviewsRepository.findWinemakerReviews(winemakerId),
      reviewsRepository.averageWinemakerRating(winemakerId),
    ]);
    return { reviews, averageRating };
  },

  async createProductReview(
    userId: string,
    productId: string,
    data: ReviewData
  ): Promise<ProductReviewWithUser> {
    const purchased = await reviewsRepository.hasPurchasedProduct(userId, productId);
    if (!purchased) throw new Error("NOT_PURCHASED");

    const existing = await reviewsRepository.findProductReview(userId, productId);
    if (existing) throw new Error("DUPLICATE_REVIEW");

    const inserted = await reviewsRepository.insertProductReview(userId, productId, data);
    const review = await reviewsRepository.findProductReviewWithUser(inserted.id);
    if (!review) throw new Error("NOT_FOUND");
    return review;
  },

  async createWinemakerReview(
    userId: string,
    winemakerId: string,
    data: ReviewData
  ): Promise<WinemakerReviewWithUser> {
    const existing = await reviewsRepository.findWinemakerReview(userId, winemakerId);
    if (existing) throw new Error("DUPLICATE_REVIEW");

    const inserted = await reviewsRepository.insertWinemakerReview(userId, winemakerId, data);
    const review = await reviewsRepository.findWinemakerReviewWithUser(inserted.id);
    if (!review) throw new Error("NOT_FOUND");
    return review;
  },

  async deleteProductReview(
    reviewId: string,
    productId: string,
    userId: string,
    userRole: string
  ): Promise<void> {
    const review = await reviewsRepository.findProductReviewById(reviewId, productId);
    if (!review) throw new Error("NOT_FOUND");

    if (userRole !== "admin" && review.userId !== userId) throw new Error("FORBIDDEN");

    await reviewsRepository.softDeleteProductReview(reviewId);
  },

  async deleteWinemakerReview(
    reviewId: string,
    winemakerId: string,
    userId: string,
    userRole: string
  ): Promise<void> {
    const review = await reviewsRepository.findWinemakerReviewById(reviewId, winemakerId);
    if (!review) throw new Error("NOT_FOUND");

    if (userRole !== "admin" && review.userId !== userId) throw new Error("FORBIDDEN");

    await reviewsRepository.softDeleteWinemakerReview(reviewId);
  },
};
