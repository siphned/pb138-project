import { z } from "zod";

const addressBody = z.object({
  city: z.string().min(1).max(255),
  country: z.string().min(1).max(50),
  houseNumber: z.string().min(1).max(20),
  postalCode: z.string().min(1).max(20),
  street: z.string().min(1).max(255),
});

export const createEventBody = z.object({
  address: addressBody,
  capacity: z.number().int().min(1).max(32767),
  description: z.string().min(1).max(10000).optional(),
  endTime: z.string().datetime(),
  inviteType: z.enum(["open", "invite_only"]),
  name: z.string().min(1).max(255),
  startTime: z.string().datetime(),
  visibility: z.enum(["public", "private"]),
});

export const updateEventBody = z.object({
  capacity: z.number().int().min(1).max(32767).optional(),
  description: z.string().min(1).max(10000).nullable().optional(),
  endTime: z.string().datetime().optional(),
  name: z.string().min(1).max(255).optional(),
  startTime: z.string().datetime().optional(),
});

export const listEventsQuery = z.object({
  from: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  page: z.coerce.number().min(1).optional(),
  q: z.string().max(255).optional(),
  registeredByMe: z.coerce.boolean().optional(),
  to: z.string().datetime().optional(),
  winemakerId: z.string().optional(),
  winemakerName: z.string().max(255).optional(),
});

export const paginationQuery = z.object({
  limit: z.coerce.number().min(1).max(100).optional(),
  page: z.coerce.number().min(1).optional(),
});

export const createCommentBody = z.object({
  body: z.string().min(1).max(2000),
});

export const eventParams = z.object({ id: z.string() });

export const commentParams = z.object({ commentId: z.string(), id: z.string() });

const addressResponse = z.object({
  city: z.string(),
  country: z.string(),
  houseNumber: z.string(),
  postalCode: z.string(),
  street: z.string(),
});

export const eventResponse = z.object({
  address: addressResponse.nullable(),
  addressId: z.string(),
  capacity: z.number(),
  createdAt: z.date(),
  description: z.string().nullable(),
  endTime: z.date(),
  id: z.string(),
  imageUrl: z.string().nullable().optional(),
  inviteType: z.string(),
  name: z.string(),
  startTime: z.date(),
  status: z.enum(["pending", "approved", "rejected"]),
  updatedAt: z.date().nullable(),
  visibility: z.enum(["public", "private"]),
  winemaker: z.object({ id: z.string(), name: z.string() }).nullable(),
  winemakerId: z.string(),
});

export const paginatedEventsResponse = z.object({
  data: z.array(eventResponse),
  limit: z.number(),
  page: z.number(),
  total: z.number(),
});

export const registrationResponse = z.object({
  createdAt: z.date(),
  eventId: z.string(),
  id: z.string(),
  userId: z.string(),
});

const commentWithUserResponse = z.object({
  body: z.string(),
  createdAt: z.date(),
  eventId: z.string(),
  id: z.string(),
  user: z.object({ fname: z.string(), id: z.string(), lname: z.string() }),
  userId: z.string(),
});

export const commentResponse = z.object({
  body: z.string(),
  createdAt: z.date(),
  eventId: z.string(),
  id: z.string(),
  userId: z.string(),
});

export const paginatedCommentsResponse = z.object({
  data: z.array(commentWithUserResponse),
  limit: z.number(),
  page: z.number(),
  total: z.number(),
});

export const invitationResponse = z.object({
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  email: z.string(),
  eventId: z.string(),
  expiresAt: z.date(),
  id: z.string(),
  token: z.string(),
  updatedAt: z.date().nullable(),
});
