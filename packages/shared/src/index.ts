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
