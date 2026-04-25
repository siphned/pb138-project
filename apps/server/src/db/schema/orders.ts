import { numeric, pgTable, smallint, uuid } from "drizzle-orm/pg-core";
import { addresses } from "./addresses";
import { products } from "./catalog";
import { deliveryTypeEnum, orderStatusEnum, paymentMethodEnum, paymentStatusEnum } from "./enums";
import { timestamptz } from "./helpers";
import { shops } from "./sellers";
import { users } from "./users";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  shippingFee: numeric("shipping_fee", { precision: 10, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at"),
  deletedAt: timestamptz("deleted_at"),
  status: orderStatusEnum("status").notNull(),
  deliveryType: deliveryTypeEnum("delivery_type").notNull(),
  shippingAddressId: uuid("shipping_address_id")
    .notNull()
    .references(() => addresses.id),
  billingAddressId: uuid("billing_address_id")
    .notNull()
    .references(() => addresses.id),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  quantity: smallint("quantity").notNull(),
  unitPriceAtPurchase: numeric("unit_price_at_purchase", {
    precision: 10,
    scale: 2,
  }).notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  updatedAt: timestamptz("updated_at"),
});
