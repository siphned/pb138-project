import { z } from "zod";

export const winemakerFiltersQuery = z.object({
  city: z.string().max(255).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).optional(),
  q: z.string().max(255).optional(),
});

export const updateWinemakerBody = z.object({
  description: z.string().min(1).optional(),
  email: z.string().email().max(255).optional(),
  name: z.string().min(1).optional(),
  phone: z.string().min(1).max(30).optional(),
  websiteUrl: z.string().nullable().optional(),
});

const addressBody = z.object({
  city: z.string().min(1).max(255),
  country: z.string().min(1).max(50),
  houseNumber: z.string().min(1).max(20),
  postalCode: z.string().min(1).max(20),
  street: z.string().min(1).max(255),
});

export const createWinemakerBody = z.object({
  address: addressBody,
  description: z.string().min(1),
  email: z.string().email().max(255).optional(),
  name: z.string().min(1).max(255),
  phone: z.string().min(1).max(30).optional(),
  websiteUrl: z.string().optional(),
});

const addressResponse = z.object({
  city: z.string(),
  country: z.string(),
  houseNumber: z.string(),
  id: z.string(),
  postalCode: z.string(),
  street: z.string(),
});

export const winemakerListItemResponse = z.object({
  address: addressResponse,
  createdAt: z.any(),
  description: z.string(),
  email: z.string().nullable(),
  id: z.string(),
  imageUrl: z.string().nullable().optional(),
  name: z.string(),
  phone: z.string().nullable(),
  updatedAt: z.any().nullable(),
  websiteUrl: z.string().nullable(),
});

const wineInProfile = z.object({
  alcoholContent: z.string(),
  color: z.string(),
  createdAt: z.any(),
  description: z.string(),
  id: z.string(),
  name: z.string(),
  quantity: z.number().int(),
  region: z.string(),
  type: z.string(),
  updatedAt: z.any().nullable(),
  vintageYear: z.number().int(),
  volumeMl: z.number().int(),
});

const eventInProfile = z.object({
  createdAt: z.any(),
  description: z.string().nullable(),
  endTime: z.any(),
  id: z.string(),
  inviteType: z.string(),
  name: z.string(),
  startTime: z.any(),
  visibility: z.string(),
});

export const winemakerProfileResponse = z.object({
  address: addressResponse,
  createdAt: z.any(),
  description: z.string(),
  email: z.string().nullable(),
  events: z.array(eventInProfile),
  id: z.string(),
  name: z.string(),
  phone: z.string().nullable(),
  updatedAt: z.any().nullable(),
  websiteUrl: z.string().nullable(),
  wines: z.array(wineInProfile),
});

export const winemakerListResponse = z.object({
  data: z.array(winemakerListItemResponse),
  limit: z.number().int(),
  page: z.number().int(),
  total: z.number().int(),
});
