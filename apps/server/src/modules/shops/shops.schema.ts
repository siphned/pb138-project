import { t } from "elysia";

const addressBody = t.Object({
  country: t.String({ minLength: 1, maxLength: 50 }),
  city: t.String({ minLength: 1, maxLength: 255 }),
  postalCode: t.String({ minLength: 1, maxLength: 20 }),
  street: t.String({ minLength: 1, maxLength: 255 }),
  houseNumber: t.String({ minLength: 1, maxLength: 20 }),
});

export const createShopBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 255 }),
  description: t.String({ minLength: 1 }),
  address: addressBody,
});

export const updateShopBody = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
  description: t.Optional(t.String({ minLength: 1 })),
  address: t.Optional(t.Partial(addressBody)),
});

const addressResponse = t.Object({
  id: t.String(),
  country: t.String(),
  city: t.String(),
  postalCode: t.String(),
  street: t.String(),
  houseNumber: t.String(),
});

export const shopResponse = t.Object({
  id: t.String(),
  ownerUserId: t.String(),
  name: t.String(),
  description: t.String(),
  address: addressResponse,
  createdAt: t.Date(),
  updatedAt: t.Nullable(t.Date()),
});
