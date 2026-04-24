import { relations } from "drizzle-orm";
import { addresses } from "./addresses";
import { availabilityExceptions, availabilityRegular } from "./availability";
import { cartItems, carts } from "./carts";
import { products, productWines, wines } from "./catalog";
import { comments, eventInvites, events } from "./events";
import { images } from "./images";
import { orderItems, orders } from "./orders";
import { productReviews, winemakerReviews } from "./reviews";
import { roleRequests } from "./role-requests";
import { shops, winemakers } from "./sellers";
import { users } from "./users";

export const addressesRelations = relations(addresses, ({ many }) => ({
  usersShipping: many(users, { relationName: "userShippingAddress" }),
  usersBilling: many(users, { relationName: "userBillingAddress" }),
  winemakers: many(winemakers),
  shops: many(shops),
  events: many(events),
  ordersShipping: many(orders, { relationName: "orderShippingAddress" }),
  ordersBilling: many(orders, { relationName: "orderBillingAddress" }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  shippingAddress: one(addresses, {
    fields: [users.shippingAddressId],
    references: [addresses.id],
    relationName: "userShippingAddress",
  }),
  billingAddress: one(addresses, {
    fields: [users.billingAddressId],
    references: [addresses.id],
    relationName: "userBillingAddress",
  }),
  winemaker: one(winemakers),
  shops: many(shops),
  cart: one(carts),
  orders: many(orders),
  productReviews: many(productReviews),
  winemakerReviews: many(winemakerReviews),
  comments: many(comments),
  roleRequests: many(roleRequests, { relationName: "roleRequestUser" }),
  reviewedRoleRequests: many(roleRequests, { relationName: "roleRequestReviewer" }),
}));

export const winemakersRelations = relations(winemakers, ({ one, many }) => ({
  user: one(users, { fields: [winemakers.userId], references: [users.id] }),
  address: one(addresses, { fields: [winemakers.addressId], references: [addresses.id] }),
  wines: many(wines),
  events: many(events),
  availabilityRegular: many(availabilityRegular),
  availabilityExceptions: many(availabilityExceptions),
  eventInvites: many(eventInvites),
  winemakerReviews: many(winemakerReviews),
}));

export const winesRelations = relations(wines, ({ one, many }) => ({
  winemaker: one(winemakers, { fields: [wines.winemakerId], references: [winemakers.id] }),
  productWines: many(productWines),
}));

export const shopsRelations = relations(shops, ({ one, many }) => ({
  owner: one(users, { fields: [shops.ownerUserId], references: [users.id] }),
  address: one(addresses, { fields: [shops.addressId], references: [addresses.id] }),
  products: many(products),
  availabilityRegular: many(availabilityRegular),
  availabilityExceptions: many(availabilityExceptions),
  orderItems: many(orderItems),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  shop: one(shops, { fields: [products.shopId], references: [shops.id] }),
  productWines: many(productWines),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  reviews: many(productReviews),
}));

export const productWinesRelations = relations(productWines, ({ one }) => ({
  product: one(products, { fields: [productWines.productId], references: [products.id] }),
  wine: one(wines, { fields: [productWines.wineId], references: [wines.id] }),
}));

export const availabilityRegularRelations = relations(availabilityRegular, ({ one }) => ({
  winemaker: one(winemakers, {
    fields: [availabilityRegular.winemakerId],
    references: [winemakers.id],
  }),
  shop: one(shops, { fields: [availabilityRegular.shopId], references: [shops.id] }),
}));

export const availabilityExceptionsRelations = relations(availabilityExceptions, ({ one }) => ({
  winemaker: one(winemakers, {
    fields: [availabilityExceptions.winemakerId],
    references: [winemakers.id],
  }),
  shop: one(shops, { fields: [availabilityExceptions.shopId], references: [shops.id] }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  winemaker: one(winemakers, { fields: [events.winemakerId], references: [winemakers.id] }),
  address: one(addresses, { fields: [events.addressId], references: [addresses.id] }),
  invites: many(eventInvites),
  comments: many(comments),
}));

export const eventInvitesRelations = relations(eventInvites, ({ one }) => ({
  event: one(events, { fields: [eventInvites.eventId], references: [events.id] }),
  winemaker: one(winemakers, {
    fields: [eventInvites.winemakerIdInvited],
    references: [winemakers.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
    relationName: "orderShippingAddress",
  }),
  billingAddress: one(addresses, {
    fields: [orders.billingAddressId],
    references: [addresses.id],
    relationName: "orderBillingAddress",
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  shop: one(shops, { fields: [orderItems.shopId], references: [shops.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  event: one(events, { fields: [comments.eventId], references: [events.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  user: one(users, { fields: [productReviews.userId], references: [users.id] }),
  product: one(products, { fields: [productReviews.productId], references: [products.id] }),
}));

export const winemakerReviewsRelations = relations(winemakerReviews, ({ one }) => ({
  user: one(users, { fields: [winemakerReviews.userId], references: [users.id] }),
  winemaker: one(winemakers, {
    fields: [winemakerReviews.winemakerId],
    references: [winemakers.id],
  }),
}));

export const imagesRelations = relations(images, () => ({}));

export const roleRequestsRelations = relations(roleRequests, ({ one }) => ({
  user: one(users, {
    fields: [roleRequests.userId],
    references: [users.id],
    relationName: "roleRequestUser",
  }),
  reviewedByAdmin: one(users, {
    fields: [roleRequests.reviewedByAdminId],
    references: [users.id],
    relationName: "roleRequestReviewer",
  }),
}));
