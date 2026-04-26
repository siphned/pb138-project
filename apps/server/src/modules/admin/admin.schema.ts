import { t } from "elysia";

export const updateUserStatusBody = t.Object({
  status: t.Union([t.Literal("active"), t.Literal("suspended"), t.Literal("banned")]),
});

export const updateEventStatusBody = t.Object({
  status: t.Union([t.Literal("approved"), t.Literal("rejected")]),
});

export const adminUserSchema = t.Object({
  id: t.String(),
  fname: t.String(),
  lname: t.String(),
  email: t.String(),
  status: t.Union([t.Literal("active"), t.Literal("suspended"), t.Literal("banned")]),
  createdAt: t.Date(),
  deletedAt: t.Union([t.Date(), t.Null()]),
});

export const paginatedUsersSchema = t.Object({
  data: t.Array(adminUserSchema),
  page: t.Number(),
  limit: t.Number(),
  total: t.Number(),
});

export const adminEventSchema = t.Object({
  id: t.String(),
  name: t.String(),
  status: t.Union([t.Literal("pending"), t.Literal("approved"), t.Literal("rejected")]),
  winemakerId: t.String(),
  capacity: t.Number(),
  startTime: t.Date(),
  endTime: t.Date(),
  inviteType: t.String(),
  visibility: t.Union([t.Literal("public"), t.Literal("private")]),
  createdAt: t.Date(),
  updatedAt: t.Union([t.Date(), t.Null()]),
  deletedAt: t.Union([t.Date(), t.Null()]),
  addressId: t.String(),
  description: t.Union([t.String(), t.Null()]),
  winemaker: t.Union([t.Object({ id: t.String(), name: t.String() }), t.Null()]),
  address: t.Union([
    t.Object({
      country: t.String(),
      city: t.String(),
      postalCode: t.String(),
      street: t.String(),
      houseNumber: t.String(),
    }),
    t.Null(),
  ]),
});

export const paginatedEventsSchema = t.Object({
  data: t.Array(adminEventSchema),
  page: t.Number(),
  limit: t.Number(),
  total: t.Number(),
});

export const adminReviewSchema = t.Object({
  id: t.String(),
  type: t.Union([t.Literal("product"), t.Literal("winemaker")]),
  userId: t.String(),
  targetId: t.String(),
  rating: t.Number(),
  body: t.Union([t.String(), t.Null()]),
  createdAt: t.Date(),
});

export const paginatedReviewsSchema = t.Object({
  data: t.Array(adminReviewSchema),
  page: t.Number(),
  limit: t.Number(),
  total: t.Number(),
});
