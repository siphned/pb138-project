import { t } from "elysia";

export const updateWinemakerBody = t.Object({
  name: t.Optional(t.String({ minLength: 1 })),
  description: t.Optional(t.String({ minLength: 1 })),
  websiteUrl: t.Optional(t.Nullable(t.String())),
  email: t.Optional(t.String({ format: "email", maxLength: 255 })),
  phone: t.Optional(t.String({ minLength: 1, maxLength: 30 })),
});

const addressResponse = t.Object({
  id: t.String(),
  country: t.String(),
  city: t.String(),
  postalCode: t.String(),
  street: t.String(),
  houseNumber: t.String(),
});

export const winemakerListItemResponse = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.String(),
  websiteUrl: t.Nullable(t.String()),
  email: t.String(),
  phone: t.String(),
  address: addressResponse,
  createdAt: t.Date(),
  updatedAt: t.Nullable(t.Date()),
});

const wineInProfile = t.Object({
  id: t.String(),
  name: t.String(),
  region: t.String(),
  type: t.String(),
  color: t.String(),
  vintageYear: t.Integer(),
  description: t.String(),
  alcoholContent: t.String(),
  volumeMl: t.Integer(),
  quantity: t.Integer(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

const eventInProfile = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.Nullable(t.String()),
  startTime: t.Date(),
  endTime: t.Date(),
  visibility: t.String(),
  inviteType: t.String(),
  createdAt: t.Date(),
});

export const winemakerProfileResponse = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.String(),
  websiteUrl: t.Nullable(t.String()),
  email: t.String(),
  phone: t.String(),
  address: addressResponse,
  wines: t.Array(wineInProfile),
  events: t.Array(eventInProfile),
  createdAt: t.Date(),
  updatedAt: t.Nullable(t.Date()),
});
