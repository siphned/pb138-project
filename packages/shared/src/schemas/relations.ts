import { relations } from "drizzle-orm";
import { addresses } from "./addresses";
import { availabilityExceptions, availabilityRegular } from "./availability";
import { cartItems, carts } from "./carts";
import { products, productWines, wines } from "./catalog";
import { eventComments, eventInvitations, eventRegistrations, events } from "./events";
import { images } from "./images";
import { orderItems, orders } from "./orders";
import { comments, reviews } from "./reviews";
import { roleRequests } from "./role-requests";
import { shops, winemakers } from "./sellers";
import { userRoles, users } from "./users";

export const addressesRelations = relations(addresses, ({ many }) => ({
  events: many(events),
  ordersBilling: many(orders, { relationName: "orderBillingAddress" }),
  ordersShipping: many(orders, { relationName: "orderShippingAddress" }),
  shops: many(shops),
  usersBilling: many(users, { relationName: "userBillingAddress" }),
  usersShipping: many(users, { relationName: "userShippingAddress" }),
  winemakers: many(winemakers),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  billingAddress: one(addresses, {
    fields: [users.billingAddressId],
    references: [addresses.id],
    relationName: "userBillingAddress",
  }),
  cart: one(carts),
  comments: many(comments),
  orders: many(orders),
  reviewedRoleRequests: many(roleRequests, { relationName: "roleRequestReviewer" }),
  reviews: many(reviews),
  roleRequests: many(roleRequests, { relationName: "roleRequestUser" }),
  roles: many(userRoles),
  shippingAddress: one(addresses, {
    fields: [users.shippingAddressId],
    references: [addresses.id],
    relationName: "userShippingAddress",
  }),
  shops: many(shops),
  winemaker: one(winemakers),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
}));

export const winemakersRelations = relations(winemakers, ({ one, many }) => ({
  address: one(addresses, { fields: [winemakers.addressId], references: [addresses.id] }),
  availabilityExceptions: many(availabilityExceptions),
  availabilityRegular: many(availabilityRegular),
  events: many(events),
  user: one(users, { fields: [winemakers.userId], references: [users.id] }),
  wines: many(wines),
}));

export const winesRelations = relations(wines, ({ one, many }) => ({
  productWines: many(productWines),
  winemaker: one(winemakers, { fields: [wines.winemakerId], references: [winemakers.id] }),
}));

export const shopsRelations = relations(shops, ({ one, many }) => ({
  address: one(addresses, { fields: [shops.addressId], references: [addresses.id] }),
  availabilityExceptions: many(availabilityExceptions),
  availabilityRegular: many(availabilityRegular),
  orderItems: many(orderItems),
  owner: one(users, { fields: [shops.ownerUserId], references: [users.id] }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  productWines: many(productWines),
  reviews: many(reviews),
  shop: one(shops, { fields: [products.shopId], references: [shops.id] }),
}));

export const productWinesRelations = relations(productWines, ({ one }) => ({
  product: one(products, { fields: [productWines.productId], references: [products.id] }),
  wine: one(wines, { fields: [productWines.wineId], references: [wines.id] }),
}));

export const availabilityRegularRelations = relations(availabilityRegular, ({ one }) => ({
  shop: one(shops, { fields: [availabilityRegular.shopId], references: [shops.id] }),
  winemaker: one(winemakers, {
    fields: [availabilityRegular.winemakerId],
    references: [winemakers.id],
  }),
}));

export const availabilityExceptionsRelations = relations(availabilityExceptions, ({ one }) => ({
  shop: one(shops, { fields: [availabilityExceptions.shopId], references: [shops.id] }),
  winemaker: one(winemakers, {
    fields: [availabilityExceptions.winemakerId],
    references: [winemakers.id],
  }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  items: many(cartItems),
  user: one(users, { fields: [carts.userId], references: [users.id] }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  address: one(addresses, { fields: [events.addressId], references: [addresses.id] }),
  comments: many(eventComments),
  invitations: many(eventInvitations),
  registrations: many(eventRegistrations),
  winemaker: one(winemakers, { fields: [events.winemakerId], references: [winemakers.id] }),
}));

export const eventInvitationsRelations = relations(eventInvitations, ({ one }) => ({
  event: one(events, { fields: [eventInvitations.eventId], references: [events.id] }),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, { fields: [eventRegistrations.eventId], references: [events.id] }),
  user: one(users, { fields: [eventRegistrations.userId], references: [users.id] }),
}));

export const eventCommentsRelations = relations(eventComments, ({ one }) => ({
  event: one(events, { fields: [eventComments.eventId], references: [events.id] }),
  user: one(users, { fields: [eventComments.userId], references: [users.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  billingAddress: one(addresses, {
    fields: [orders.billingAddressId],
    references: [addresses.id],
    relationName: "orderBillingAddress",
  }),
  items: many(orderItems),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
    relationName: "orderShippingAddress",
  }),
  user: one(users, { fields: [orders.userId], references: [users.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
  shop: one(shops, { fields: [orderItems.shopId], references: [shops.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  comments: many(comments),
  product: one(products, {
    fields: [reviews.entityId],
    references: [products.id],
  }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  winemaker: one(winemakers, {
    fields: [reviews.entityId],
    references: [winemakers.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  review: one(reviews, { fields: [comments.reviewId], references: [reviews.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}));

export const imagesRelations = relations(images, () => ({}));

export const roleRequestsRelations = relations(roleRequests, ({ one }) => ({
  reviewedByAdmin: one(users, {
    fields: [roleRequests.adminUserId],
    references: [users.id],
    relationName: "roleRequestReviewer",
  }),
  user: one(users, {
    fields: [roleRequests.userId],
    references: [users.id],
    relationName: "roleRequestUser",
  }),
}));
