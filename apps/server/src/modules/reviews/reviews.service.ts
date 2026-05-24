<<<<<<< HEAD
import { db } from "../../db";
import { parsePagination } from "../../utils/pagination";
import { AlreadyReviewedError, NotPurchasedError, ReviewNotFoundError } from "./reviews.errors";
import type { ReviewWithUser } from "./reviews.repository";
import * as reviewsRepo from "./reviews.repository";

type ReviewListResult<T> = { reviews: T[]; averageRating: number | null; totalCount: number };

export class ReviewsService {
=======
import type { IReviewsRepository, ReviewWithUser } from "./reviews.repository";
import { reviewsRepository } from "./reviews.repository";

type ReviewListResult<T> = { reviews: T[]; averageRating: number | null };

export class ReviewsService {
  constructor(private reviewsRepo: IReviewsRepository) {}

>>>>>>> origin/main
  async createProductReview(
    userId: string,
    productId: string,
    data: { rating: number; body?: string }
  ): Promise<ReviewWithUser> {
    const [hasPurchased, existing] = await Promise.all([
<<<<<<< HEAD
      reviewsRepo.hasPurchasedProduct(db, userId, productId),
      reviewsRepo.findUserReview(db, userId, productId, "product"),
    ]);

    if (!hasPurchased) throw new NotPurchasedError();
    if (existing) throw new AlreadyReviewedError();

    const review = await reviewsRepo.insertReview(db, userId, productId, "product", data);
    const withUser = await reviewsRepo.findReviewWithUser(db, review.id);
    if (!withUser) throw new ReviewNotFoundError();
=======
      this.reviewsRepo.hasPurchasedProduct(userId, productId),
      this.reviewsRepo.findUserReview(userId, productId, "product"),
    ]);

    if (!hasPurchased) throw new Error("NOT_PURCHASED");
    if (existing) throw new Error("ALREADY_REVIEWED");

    const review = await this.reviewsRepo.insertReview(userId, productId, "product", data);
    const withUser = await this.reviewsRepo.findReviewWithUser(review.id);
    if (!withUser) throw new Error("NOT_FOUND");
>>>>>>> origin/main
    return withUser;
  }

  async createWinemakerReview(
    userId: string,
    winemakerId: string,
    data: { rating: number; body?: string }
  ): Promise<ReviewWithUser> {
<<<<<<< HEAD
    const [hasPurchased, existing] = await Promise.all([
      reviewsRepo.hasPurchasedFromWinemaker(db, userId, winemakerId),
      reviewsRepo.findUserReview(db, userId, winemakerId, "winemaker"),
    ]);

    if (!hasPurchased) throw new NotPurchasedError();
    if (existing) throw new AlreadyReviewedError();

    const review = await reviewsRepo.insertReview(db, userId, winemakerId, "winemaker", data);
    const withUser = await reviewsRepo.findReviewWithUser(db, review.id);
    if (!withUser) throw new ReviewNotFoundError();
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

    if (!hasPurchased) throw new NotPurchasedError();
    if (existing) throw new AlreadyReviewedError();

    const review = await reviewsRepo.insertReview(db, userId, wineId, "wine", data);
    const withUser = await reviewsRepo.findReviewWithUser(db, review.id);
    if (!withUser) throw new ReviewNotFoundError();
=======
    const existing = await this.reviewsRepo.findUserReview(userId, winemakerId, "winemaker");
    if (existing) throw new Error("ALREADY_REVIEWED");

    const review = await this.reviewsRepo.insertReview(userId, winemakerId, "winemaker", data);
    const withUser = await this.reviewsRepo.findReviewWithUser(review.id);
    if (!withUser) throw new Error("NOT_FOUND");
>>>>>>> origin/main
    return withUser;
  }

  async deleteReview(
    reviewId: string,
    userId: string,
    userRole: string,
    entityId: string,
<<<<<<< HEAD
    entityType: "product" | "winemaker" | "wine"
  ): Promise<void> {
    const review = await reviewsRepo.findUserReview(db, userId, entityId, entityType);
    if (!review || review.id !== reviewId) {
      if (userRole === "admin") {
        const byId = await reviewsRepo.findById(db, reviewId);
        if (!byId) throw new ReviewNotFoundError();
      } else {
        throw new ReviewNotFoundError();
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
=======
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

  async listProductReviews(productId: string): Promise<ReviewListResult<ReviewWithUser>> {
    const [reviews, averageRating] = await Promise.all([
      this.reviewsRepo.findReviews(productId, "product"),
      this.reviewsRepo.averageRating(productId, "product"),
    ]);
    return { averageRating, reviews };
  }

  async listWinemakerReviews(winemakerId: string): Promise<ReviewListResult<ReviewWithUser>> {
    const [reviews, averageRating] = await Promise.all([
      this.reviewsRepo.findReviews(winemakerId, "winemaker"),
      this.reviewsRepo.averageRating(winemakerId, "winemaker"),
    ]);
    return { averageRating, reviews };
  }
}

export const reviewsService = new ReviewsService(reviewsRepository);
>>>>>>> origin/main
