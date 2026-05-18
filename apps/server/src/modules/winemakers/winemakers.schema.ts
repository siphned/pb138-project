import { t } from "elysia";

export const winemakerFiltersQuery = t.Object({
  q: t.Optional(t.String({ maxLength: 255 })),
});

export const updateWinemakerBody = t.Object({
  description: t.Optional(t.String({ minLength: 1 })),
  email: t.Optional(t.String({ format: "email", maxLength: 255 })),
  name: t.Optional(t.String({ minLength: 1 })),
  phone: t.Optional(t.String({ maxLength: 30, minLength: 1 })),
  websiteUrl: t.Optional(t.Nullable(t.String())),
});

const addressResponse = t.Object({
  city: t.String(),
  country: t.String(),
  houseNumber: t.String(),
  id: t.String(),
  postalCode: t.String(),
  street: t.String(),
});

export const winemakerListItemResponse = t.Object({
  address: addressResponse,
  createdAt: t.Any(),
  description: t.String(),
  email: t.Nullable(t.String()),
  id: t.String(),
  name: t.String(),
  phone: t.Nullable(t.String()),
  updatedAt: t.Nullable(t.Any()),
  websiteUrl: t.Nullable(t.String()),
});

const wineInProfile = t.Object({
  alcoholContent: t.String(),
  color: t.String(),
  createdAt: t.Any(),
  description: t.String(),
  id: t.String(),
  name: t.String(),
  quantity: t.Integer(),
  region: t.String(),
  type: t.String(),
  updatedAt: t.Nullable(t.Any()),
  vintageYear: t.Integer(),
  volumeMl: t.Integer(),
});

const eventInProfile = t.Object({
  createdAt: t.Any(),
  description: t.Nullable(t.String()),
  endTime: t.Any(),
  id: t.String(),
  inviteType: t.String(),
  name: t.String(),
  startTime: t.Any(),
  visibility: t.String(),
});

export const winemakerProfileResponse = t.Object({
  address: addressResponse,
  createdAt: t.Any(),
  description: t.String(),
  email: t.Nullable(t.String()),
  events: t.Array(eventInProfile),
  id: t.String(),
  name: t.String(),
  phone: t.Nullable(t.String()),
  updatedAt: t.Nullable(t.Any()),
  websiteUrl: t.Nullable(t.String()),
  wines: t.Array(wineInProfile),
});
