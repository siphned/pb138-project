import { t } from "elysia";

export const shopFiltersQuery = t.Object({
  city: t.Optional(t.String({ maxLength: 255 })),
  ownerUserId: t.Optional(t.String()),
  q: t.Optional(t.String({ maxLength: 255 })),
});

const addressBody = t.Object({
  city: t.String({ maxLength: 255, minLength: 1 }),
  country: t.String({ maxLength: 50, minLength: 1 }),
  houseNumber: t.String({ maxLength: 20, minLength: 1 }),
  postalCode: t.String({ maxLength: 20, minLength: 1 }),
  street: t.String({ maxLength: 255, minLength: 1 }),
});

export const createShopBody = t.Object({
  address: addressBody,
  description: t.String({ minLength: 1 }),
  name: t.String({ maxLength: 255, minLength: 1 }),
});

export const updateShopBody = t.Object({
  address: t.Optional(t.Partial(addressBody)),
  description: t.Optional(t.String({ minLength: 1 })),
  name: t.Optional(t.String({ maxLength: 255, minLength: 1 })),
});

const addressResponse = t.Object({
  city: t.String(),
  country: t.String(),
  houseNumber: t.String(),
  id: t.String(),
  postalCode: t.String(),
  street: t.String(),
});

export const shopResponse = t.Object({
  address: addressResponse,
  createdAt: t.Date(),
  description: t.String(),
  id: t.String(),
  name: t.String(),
  ownerUserId: t.String(),
  updatedAt: t.Union([t.Date(), t.Null()]),
});
