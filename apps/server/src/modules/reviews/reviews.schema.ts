import { t } from "elysia";

export const createReviewBody = t.Object({
  body: t.Optional(t.String({ maxLength: 2000, minLength: 1 })),
  rating: t.Integer({ maximum: 5, minimum: 1 }),
});

const reviewUserInfo = t.Object({
  fname: t.String(),
  id: t.String(),
  lname: t.String(),
});

export const reviewResponse = t.Object({
  body: t.Nullable(t.String()),
  createdAt: t.Date(),
  id: t.String(),
  rating: t.Integer(),
  user: reviewUserInfo,
  userId: t.String(),
});

export const reviewListResponse = t.Object({
  averageRating: t.Nullable(t.Number()),
  reviews: t.Array(reviewResponse),
});
