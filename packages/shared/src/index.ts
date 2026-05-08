/**
 * @repo/shared — Centralized types, schemas, and constants.
 * Single source of truth for type safety across backend and frontend.
 */

export * from "./errors/base";

// Re-export all Zod schemas (model layer)
// Re-export Drizzle table definitions (server-side only)
export {
  type AddressModel,
  type AvailabilityExceptionModel,
  type AvailabilityRegularModel,
  addresses,
  // addresses
  addressInsertSchema,
  addressSelectSchema,
  // availability
  availabilityExceptionInsertSchema,
  availabilityExceptionSelectSchema,
  availabilityExceptions,
  availabilityRegular,
  availabilityRegularInsertSchema,
  availabilityRegularSelectSchema,
  type CartItemModel,
  type CartModel,
  type CommentModel,
  // carts
  cartInsertSchema,
  cartItemInsertSchema,
  cartItemSelectSchema,
  cartItems,
  cartSelectSchema,
  carts,
  commentInsertSchema,
  commentSelectSchema,
  comments,
  type EventCommentModel,
  type EventInvitationModel,
  type EventModel,
  type EventRegistrationModel,
  eventCommentInsertSchema,
  eventCommentSelectSchema,
  eventComments,
  // events
  eventInsertSchema,
  eventInvitationInsertSchema,
  eventInvitationSelectSchema,
  eventInvitations,
  eventRegistrationInsertSchema,
  eventRegistrationSelectSchema,
  eventRegistrations,
  eventSelectSchema,
  events,
  type GuestSessionModel,
  // guest-sessions
  guestSessionInsertSchema,
  guestSessionSelectSchema,
  guestSessions,
  type ImageModel,
  // images
  imageInsertSchema,
  imageSelectSchema,
  images,
  insertUserRoleSchema,
  // users
  insertUserSchema,
  type OrderItemModel,
  type OrderModel,
  // orders
  orderInsertSchema,
  orderItemInsertSchema,
  orderItemSelectSchema,
  orderItems,
  orderSelectSchema,
  orders,
  type ProductModel,
  type ProductWineModel,
  type ProfileUpdate,
  productInsertSchema,
  productSelectSchema,
  products,
  productWineInsertSchema,
  productWineSelectSchema,
  productWines,
  profileUpdateSchema,
  type ReviewModel,
  type RoleRequestModel,
  // reviews
  reviewInsertSchema,
  reviewSelectSchema,
  reviews,
  // role-requests
  roleRequestInsertSchema,
  roleRequestSelectSchema,
  roleRequests,
  type ShopModel,
  type SupplyAgreementModel,
  selectUserRoleSchema,
  selectUserSchema,
  shopInsertSchema,
  shopSelectSchema,
  shops,
  // supply-agreements
  supplyAgreementInsertSchema,
  supplyAgreementSelectSchema,
  supplyAgreements,
  type UserModel,
  type UserRole,
  userRoles,
  users,
  type WineModel,
  type WinemakerModel,
  // catalog
  wineInsertSchema,
  // sellers
  winemakerInsertSchema,
  winemakerSelectSchema,
  winemakers,
  wineSelectSchema,
  wines,
} from "./schemas";
// Re-export common enums + request schemas
export {
  type AddressBody,
  type AppRole,
  addressBodySchema,
  appRoleSchema,
} from "./schemas/common";
export { type DashboardStats, dashboardStatsSchema } from "./schemas/dashboard";
