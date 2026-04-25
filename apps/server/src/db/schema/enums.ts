import { pgEnum } from "drizzle-orm/pg-core";

export const roleRequestTypeEnum = pgEnum("role_request_type", ["winemaker", "shop_owner"]);
export const roleRequestStatusEnum = pgEnum("role_request_status", [
  "pending",
  "approved",
  "rejected",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]);
export const deliveryTypeEnum = pgEnum("delivery_type", ["pickup", "shipping"]);
export const eventVisibilityEnum = pgEnum("event_visibility", ["public", "private"]);
export const eventInviteStatusEnum = pgEnum("event_invite_status", [
  "pending",
  "accepted",
  "declined",
  "expired",
]);
export const wineColorEnum = pgEnum("wine_color", [
  "red",
  "white",
  "rosé",
  "orange",
  "gray",
  "tawny",
  "yellow",
]);
export const wineTypeEnum = pgEnum("wine_type", ["still", "sparkling", "fortified", "dessert"]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "authorized",
  "captured",
  "failed",
  "cancelled",
  "refunded",
  "partially_refunded",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "card",
  "bank_transfer",
  "cash_on_delivery",
]);
export const eventStatusEnum = pgEnum("event_status", ["pending", "approved", "rejected"]);

export const supplyAgreementStatusEnum = pgEnum("supply_agreement_status", [
  "pending",
  "approved",
  "rejected",
]);
