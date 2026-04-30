import { parsePagination } from "../../utils/pagination";
import type { IReviewsRepository, ReviewWithUser } from "./reviews.repository";
import { reviewsRepository } from "./reviews.repository";

type ReviewListResult<T> = { reviews: T[]; averageRating: number | null; totalCount: number };

export class ReviewsService {
  constructor(private reviewsRepo: IReviewsRepository) {}

  async createProductReview(
    userId: string,
    productId: string,
    data: { rating: number; body?: string }
  ): Promise<ReviewWithUser> {
    const [hasPurchased, existing] = await Promise.all([
      this.reviewsRepo.hasPurchasedProduct(userId, productId),
      this.reviewsRepo.findUserReview(userId, productId, "product"),
    ]);

    if (!hasPurchased) throw new Error("NOT_PURCHASED");
    if (existing) throw new Error("ALREADY_REVIEWED");

    const review = await this.reviewsRepo.insertReview(userId, productId, "product", data);
    const withUser = await this.reviewsRepo.findReviewWithUser(review.id);
    if (!withUser) throw new Error("NOT_FOUND");
    return withUser;
  }

  async createWinemakerReview(
    userId: string,
    winemakerId: string,
    data: { rating: number; body?: string }
  ): Promise<ReviewWithUser> {
    const existing = await this.reviewsRepo.findUserReview(userId, winemakerId, "winemaker");
    if (existing) throw new Error("ALREADY_REVIEWED");

    const review = await this.reviewsRepo.insertReview(userId, winemakerId, "winemaker", data);
    const withUser = await this.reviewsRepo.findReviewWithUser(review.id);
    if (!withUser) throw new Error("NOT_FOUND");
    return withUser;
  }

  async deleteReview(
    reviewId: string,
    userId: string,
    userRole: string,
    entityId: string,
    entityType: "product" | "winemaker"
  ): Promise<void> {
    const review = await this.reviewsRepo.findUserReview(userId, entityId, entityType);
    if (!review || review.id !== reviewId) {
      // Also check by ID if it's admin
      if (userRole === "admin") {
        const byId = await this.reviewsRepo.findById(reviewId);
        if (!byId) throw new Error("NOT_FOUND");
      } else {
        throw new Error("NOT_FOUND");
      }
    }

    await this.reviewsRepo.softDelete(reviewId);
  }

  async listProductReviews(
    productId: string,
    opts: { page: number; limit: number; sort: "newest" | "highest" | "lowest" }
  ): Promise<ReviewListResult<ReviewWithUser>> {
    const { limit, offset } = parsePagination(opts);
    const [reviews, totalCount, averageRating] = await Promise.all([
      this.reviewsRepo.findReviews(productId, "product", { limit, offset, sort: opts.sort }),
      this.reviewsRepo.countReviews(productId, "product"),
      this.reviewsRepo.averageRating(productId, "product"),
    ]);
    return { averageRating, reviews, totalCount };
  }

  async listWinemakerReviews(
    winemakerId: string,
    opts: { page: number; limit: number; sort: "newest" | "highest" | "lowest" }
  ): Promise<ReviewListResult<ReviewWithUser>> {
    const { limit, offset } = parsePagination(opts);
    const [reviews, totalCount, averageRating] = await Promise.all([
      this.reviewsRepo.findReviews(winemakerId, "winemaker", { limit, offset, sort: opts.sort }),
      this.reviewsRepo.countReviews(winemakerId, "winemaker"),
      this.reviewsRepo.averageRating(winemakerId, "winemaker"),
    ]);
    return { averageRating, reviews, totalCount };
  }
}

export const reviewsService = new ReviewsService(reviewsRepository);
