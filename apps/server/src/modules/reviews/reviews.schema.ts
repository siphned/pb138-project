import { t } from "elysia";

export const createReviewBody = t.Object({
  body: t.Optional(t.String({ maxLength: 2000, minLength: 1 })),
  rating: t.Integer({ maximum: 5, minimum: 1 }),
});

<<<<<<< HEAD
export const listReviewsQuery = t.Object({
  limit: t.Optional(t.Integer({ maximum: 100, minimum: 1 })),
  page: t.Optional(t.Integer({ minimum: 1 })),
  sort: t.Optional(t.Union([t.Literal("newest"), t.Literal("highest"), t.Literal("lowest")])),
});

=======
>>>>>>> origin/main
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
<<<<<<< HEAD
  totalCount: t.Integer(),
=======
>>>>>>> origin/main
});
