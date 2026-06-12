import { z } from "zod";

export const reviewParams = z.object({ id: z.string() });

export const createReviewBody = z.object({
  body: z.string().min(1).max(2000).optional(),
  rating: z.number().int().min(1).max(5),
});

export const listReviewsQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).optional(),
  sort: z.enum(["newest", "highest", "lowest"]).optional(),
});

export const deleteReviewQuery = z.object({
  entityId: z.string(),
  entityType: z.enum(["product", "winemaker", "wine"]),
});

export const deleteReviewResponse = z.object({ success: z.boolean() });

const reviewUserInfo = z.object({
  fname: z.string(),
  id: z.string(),
  lname: z.string(),
});

export const reviewResponse = z.object({
  body: z.string().nullable(),
  createdAt: z.date(),
  id: z.string(),
  rating: z.number().int(),
  user: reviewUserInfo,
  userId: z.string(),
});

export const reviewListResponse = z.object({
  averageRating: z.number().nullable(),
  reviews: z.array(reviewResponse),
  totalCount: z.number().int(),
});
