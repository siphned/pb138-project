import { t } from "elysia";

export const adminUserResponse = t.Object({
  createdAt: t.Date(),
  deletedAt: t.Union([t.Date(), t.Null()]),
  email: t.String(),
  fname: t.String(),
  id: t.String(),
  lname: t.String(),
  role: t.String(),
  status: t.String(),
});

export const adminEventResponse = t.Object({
  address: t.Nullable(
    t.Object({
      city: t.String(),
      country: t.String(),
      houseNumber: t.String(),
      postalCode: t.String(),
      street: t.String(),
    })
  ),
  addressId: t.String(),
  endTime: t.Date(),
  id: t.String(),
  name: t.String(),
  startTime: t.Date(),
  status: t.String(),
  winemaker: t.Nullable(
    t.Object({
      id: t.String(),
      name: t.String(),
    })
  ),
  winemakerId: t.String(),
});

export const adminReviewResponse = t.Object({
  body: t.Nullable(t.String()),
  createdAt: t.Date(),
  entityId: t.String(),
  entityType: t.String(),
  id: t.String(),
  rating: t.Number(),
  user: t.Nullable(
    t.Object({
      fname: t.String(),
      id: t.String(),
      lname: t.String(),
    })
  ),
  userId: t.String(),
});

export const adminStatsResponse = t.Object({
  events: t.Number(),
  reviews: t.Number(),
  users: t.Number(),
});
