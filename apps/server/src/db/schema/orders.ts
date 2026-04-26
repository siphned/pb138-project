import { numeric, pgTable, smallint, text, uuid } from "drizzle-orm/pg-core";
import { addresses } from "./addresses";
import { products } from "./catalog";
import { deliveryTypeEnum, orderStatusEnum, paymentMethodEnum, paymentStatusEnum } from "./enums";
import { guestSessions } from "./guest-sessions";
import { timestamptz } from "./helpers";
import { shops } from "./sellers";
import { users } from "./users";

export const orders = pgTable("orders", {
  billingAddressId: uuid("billing_address_id")
    .notNull()
    .references(() => addresses.id),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  deliveryType: deliveryTypeEnum("delivery_type").notNull(),
  discount: numeric("discount", { precision: 10, scale: 2 }).notNull(),
  guestEmail: text("guest_email"),
  guestName: text("guest_name"),
  guestSessionId: uuid("guest_session_id").references(() => guestSessions.id),
  id: uuid("id").primaryKey().defaultRandom(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull(),
  shippingAddressId: uuid("shipping_address_id")
    .notNull()
    .references(() => addresses.id),
  shippingFee: numeric("shipping_fee", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  updatedAt: timestamptz("updated_at"),
  userId: uuid("user_id").references(() => users.id),
});

export const orderItems = pgTable("order_items", {
  deletedAt: timestamptz("deleted_at"),
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  quantity: smallint("quantity").notNull(),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id),
  unitPriceAtPurchase: numeric("unit_price_at_purchase", { precision: 10, scale: 2 }).notNull(),
});
