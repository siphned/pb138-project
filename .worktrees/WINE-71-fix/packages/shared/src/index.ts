import { z } from "zod";

export const ProfileUpdateSchema = z.object({
  avatarUrl: z.string().optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email address"),
  location: z.string().min(1, "Address is required"),
  name: z.string().min(1, "Name is required"),
  website: z.string().url("Invalid website URL").or(z.literal("")),
});

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

export const DashboardStatsSchema = z.object({
  eventsAttended: z.number(),
  revenue: z.number().optional(),
  totalOrders: z.number(),
  wineCount: z.number().optional(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export const WineSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number(),
  stock: z.number(),
  type: z.enum(["Red", "White", "Rosé", "Sparkling"]),
  year: z.number(),
});

export type Wine = z.infer<typeof WineSchema>;
