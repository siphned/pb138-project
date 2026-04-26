import { t } from "elysia";

export const adminUserResponse = t.Object({
  id: t.String(),
  fname: t.String(),
  lname: t.String(),
  email: t.String(),
  role: t.String(),
  status: t.String(),
  createdAt: t.Date(),
  deletedAt: t.Union([t.Date(), t.Null()]),
});

export const adminEventResponse = t.Object({
  id: t.String(),
  name: t.String(),
  winemakerId: t.String(),
  addressId: t.String(),
  status: t.String(),
  startTime: t.Date(),
  endTime: t.Date(),
  winemaker: t.Nullable(
    t.Object({
      id: t.String(),
      name: t.String(),
    })
  ),
  address: t.Nullable(
    t.Object({
      country: t.String(),
      city: t.String(),
      postalCode: t.String(),
      street: t.String(),
      houseNumber: t.String(),
    })
  ),
});

export const adminReviewResponse = t.Object({
  id: t.String(),
  userId: t.String(),
  entityId: t.String(),
  entityType: t.String(),
  rating: t.Number(),
  body: t.Nullable(t.String()),
  createdAt: t.Date(),
  user: t.Nullable(
    t.Object({
      id: t.String(),
      fname: t.String(),
      lname: t.String(),
    })
  ),
});

export const adminStatsResponse = t.Object({
  users: t.Number(),
  events: t.Number(),
  reviews: t.Number(),
});
