/**
 * Frontend type definitions.
 * Core types are re-exported from @repo/shared for single source of truth.
 */

// ─── Shared Types (from @repo/shared) ──────────────────────────────────

// Insert types
export type {
  AddressBody,
  // Model types
  AddressModel as Address,
  AddressModel,
  AppRole,
  AvailabilityExceptionModel as AvailabilityException,
  AvailabilityRegularModel as AvailabilityRegular,
  CartItemModel,
  CartModel as Cart,
  CartModel,
  CommentModel as Comment,
  DashboardStats,
  EventCommentModel as EventComment,
  EventModel as Event,
  EventModel,
  EventRegistrationModel as EventRegistration,
  GuestSessionModel as GuestSession,
  OrderItemModel,
  OrderModel as Order,
  ProductModel as Product,
  ProductModel,
  ProductWineModel as ProductWine,
  ProfileUpdate,
  ReviewModel as Review,
  RoleRequestModel as RoleRequest,
  ShopModel as Shop,
  SupplyAgreementModel as SupplyAgreement,
  UserModel as User,
  UserModel,
  WineModel as Wine,
  WinemakerModel as Winemaker,
} from "@repo/shared";
