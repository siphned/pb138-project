import { t } from "elysia";

export const createReviewBody = t.Object({
  rating: t.Integer({ minimum: 1, maximum: 5 }),
  body: t.Optional(t.String({ minLength: 1, maxLength: 2000 })),
});

const reviewUserInfo = t.Object({
  id: t.String(),
  fname: t.String(),
  lname: t.String(),
});

export const reviewResponse = t.Object({
  id: t.String(),
  userId: t.String(),
  user: reviewUserInfo,
  rating: t.Integer(),
  body: t.Nullable(t.String()),
  createdAt: t.Date(),
});

export const reviewListResponse = t.Object({
  reviews: t.Array(reviewResponse),
  averageRating: t.Nullable(t.Number()),
});
