<<<<<<< HEAD
/**
 * @repo/shared — Centralized types, schemas, and constants.
 * Single source of truth for type safety across backend and frontend.
 */

export * from "./errors/base";

// Re-export only the necessary types for the frontend.
// This prevents the frontend from being coupled to Drizzle ORM objects.
export type {
  AddressModel,
  AvailabilityExceptionModel,
  AvailabilityRegularModel,
  CartItemModel,
  CartModel,
  CommentModel,
  EventCommentModel,
  EventInvitationModel,
  EventModel,
  EventRegistrationModel,
  GuestSessionModel,
  ImageModel,
  OrderItemModel,
  OrderModel,
  ProductModel,
  ProductWineModel,
  ProfileUpdate,
  ReviewModel,
  RoleRequestModel,
  ShopModel,
  SupplyAgreementModel,
  UserModel,
  UserRole,
  WineModel,
  WinemakerModel,
} from "./schemas";

// Re-export common enums + request schemas
export {
  type AddressBody,
  type AppRole,
  addressBodySchema,
  appRoleSchema,
} from "./schemas/common";
export { type DashboardStats, dashboardStatsSchema } from "./schemas/dashboard";
=======
import { z } from "zod";

export const ProfileUpdateSchema = z.object({
  avatarUrl: z.string().optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email address"),
  location: z.string().min(1, "Address is required"),
  name: z.string().min(1, "Name is required"),
  website: z.string().url("Invalid website URL").or(z.literal("")),
});

// Inferred row types re-exported for frontend consumers.
// Do NOT export Drizzle table objects here — use @repo/shared/schemas for server-side access.
export type {
  Address,
  AvailabilityException,
  AvailabilityRegular,
  Cart,
  Comment,
  Event,
  EventComment,
  EventRegistration,
  GuestSession,
  NewAddress,
  NewEvent,
  NewProduct,
  NewProductWine,
  NewUser,
  Order,
  Product,
  ProductWine,
  Review,
  RoleRequest,
  Shop,
  SupplyAgreement,
  User,
  Wine,
  Winemaker,
} from "./schemas";

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
>>>>>>> origin/main
