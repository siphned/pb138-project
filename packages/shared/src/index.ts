import { z } from "zod";

export const ProfileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Address is required"),
  website: z.string().url("Invalid website URL").or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email address"),
  avatarUrl: z.string().optional().or(z.literal("")),
});

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

export const DashboardStatsSchema = z.object({
  totalOrders: z.number(),
  eventsAttended: z.number(),
  revenue: z.number().optional(),
  wineCount: z.number().optional(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export const WineSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  year: z.number(),
  type: z.enum(["Red", "White", "Rosé", "Sparkling"]),
  stock: z.number(),
  price: z.number(),
});

export type Wine = z.infer<typeof WineSchema>;
