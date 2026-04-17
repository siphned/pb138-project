import {
  date,
  decimal,
  integer,
  numeric,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

const timestamptz = (name: string) => timestamp(name, { withTimezone: true })

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['user', 'admin'])
export const roleRequestTypeEnum = pgEnum('role_request_type', ['winemaker', 'shop_owner'])
export const roleRequestStatusEnum = pgEnum('role_request_status', ['pending', 'approved', 'rejected'])
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
export const deliveryTypeEnum = pgEnum('delivery_type', ['pickup', 'shipping'])
export const eventVisibilityEnum = pgEnum('event_visibility', ['public', 'private'])
export const eventInviteStatusEnum = pgEnum('event_invite_status', ['pending', 'accepted', 'declined', 'expired'])
export const wineColorEnum = pgEnum('wine_color', ['red', 'white', 'rosé', 'orange', 'gray', 'tawny', 'yellow'])
export const wineTypeEnum = pgEnum('wine_type', ['still', 'sparkling', 'fortified', 'dessert'])
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'authorized', 'captured', 'failed', 'cancelled', 'refunded', 'partially_refunded'])
export const paymentMethodEnum = pgEnum('payment_method', ['card', 'bank_transfer', 'cash_on_delivery'])

// ─── Tables ───────────────────────────────────────────────────────────────────

export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  country: varchar('country', { length: 50 }).notNull(),
  city: varchar('city', { length: 255 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  street: varchar('street', { length: 255 }).notNull(),
  houseNumber: varchar('house_number', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),
  fname: varchar('fname', { length: 30 }).notNull(),
  lname: varchar('lname', { length: 30 }).notNull(),
  email: text('email').notNull().unique(),
  role: userRoleEnum('role').notNull().default('user'),
  shippingAddressId: uuid('shipping_address_id').references(() => addresses.id),
  billingAddressId: uuid('billing_address_id').references(() => addresses.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
})

export const winemakers = pgTable('winemakers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  websiteUrl: text('websiteurl'),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  addressId: uuid('address_id').notNull().references(() => addresses.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
})

export const shops = pgTable('shops', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerUserId: uuid('owner_user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  addressId: uuid('address_id').notNull().references(() => addresses.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
})

export const wines = pgTable('wines', {
  id: uuid('id').primaryKey().defaultRandom(),
  winemakerId: uuid('winemaker_id').notNull().references(() => winemakers.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  composition: text('composition').notNull(),
  attribution: text('attribution').notNull(),
  vintageYear: smallint('vintage_year').notNull(),
  type: wineTypeEnum('type').notNull(),
  color: wineColorEnum('color').notNull(),
  alcoholContent: decimal('alcohol_content', { precision: 4, scale: 2 }).notNull(),
  volumeMl: smallint('volume_ml').notNull(),
  quantity: smallint('quantity').notNull(),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
  updatedAt: timestamptz('updated_at').notNull().defaultNow(),
  deletedAt: timestamptz('deleted_at'),
})

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  shopId: uuid('shop_id').notNull().references(() => shops.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  quantity: smallint('quantity').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
})

export const productWines = pgTable('product_wines', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id),
  wineId: uuid('wine_id').notNull().references(() => wines.id),
  quantity: smallint('quantity').notNull(),
})

export const availabilityRegular = pgTable('availability_regular', {
  id: uuid('id').primaryKey().defaultRandom(),
  winemakerId: uuid('winemaker_id').references(() => winemakers.id),
  shopId: uuid('shop_id').notNull().references(() => shops.id),
  dow: smallint('dow').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  validFrom: date('valid_from').notNull(),
  validTo: date('valid_to'),
  type: varchar('type', { length: 255 }).notNull(),
})

export const availabilityExceptions = pgTable('availability_exceptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  winemakerId: uuid('winemaker_id').references(() => winemakers.id),
  shopId: uuid('shop_id').notNull().references(() => shops.id),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at').notNull(),
  action: varchar('action', { length: 255 }).notNull(),
  reason: text('reason'),
})

export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique().references(() => users.id),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
  updatedAt: timestamptz('updated_at').notNull().defaultNow(),
})

export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  cartId: uuid('cart_id').notNull().references(() => carts.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  quantity: smallint('quantity').notNull(),
  createdAt: timestamptz('created_at').notNull().defaultNow(),
  updatedAt: timestamptz('updated_at').notNull().defaultNow(),
})

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  winemakerId: uuid('winemaker_id').notNull().references(() => winemakers.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  addressId: uuid('address_id').notNull().references(() => addresses.id),
  startTime: timestamptz('start_time').notNull(),
  endTime: timestamptz('end_time').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  inviteType: varchar('invite_type', { length: 255 }).notNull(),
  visibility: eventVisibilityEnum('visibility').notNull(),
})

export const eventInvites = pgTable('event_invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id),
  winemakerIdInvited: uuid('winemaker_id_invited').notNull().references(() => winemakers.id),
  token: uuid('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  status: eventInviteStatusEnum('status').notNull(),
})

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  shippingFee: numeric('shipping_fee', { precision: 10, scale: 2 }).notNull(),
  discount: numeric('discount', { precision: 10, scale: 2 }).notNull(),
  paymentStatus: paymentStatusEnum('payment_status').notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
  status: orderStatusEnum('status').notNull(),
  deliveryType: deliveryTypeEnum('delivery_type').notNull(),
  shippingAddressId: uuid('shipping_address_id').notNull().references(() => addresses.id),
  billingAddressId: uuid('billing_address_id').notNull().references(() => addresses.id),
})

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  shopId: uuid('shop_id').notNull().references(() => shops.id),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  quantity: smallint('quantity').notNull(),
  unitPriceAtPurchase: numeric('unit_price_at_purchase', { precision: 10, scale: 2 }).notNull(),
})

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
})

export const productReviews = pgTable('product_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  rating: smallint('rating').notNull(),
  body: text('body'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
})

export const winemakerReviews = pgTable('winemaker_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  winemakerId: uuid('winemaker_id').notNull().references(() => winemakers.id),
  rating: smallint('rating').notNull(),
  body: text('body'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
  deletedAt: timestamp('deleted_at'),
})

export const images = pgTable('images', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull(),
  altText: text('alt_text'),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
})

export const roleRequests = pgTable('role_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  requestedRole: roleRequestTypeEnum('requested_role').notNull(),
  status: roleRequestStatusEnum('status').notNull().default('pending'),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  details: text('details'),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedByAdminId: uuid('reviewed_by_admin_id').references(() => users.id),
})

// ─── Inferred types ───────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Shop = typeof shops.$inferSelect
export type Winemaker = typeof winemakers.$inferSelect
export type Product = typeof products.$inferSelect
export type Order = typeof orders.$inferSelect
export type Cart = typeof carts.$inferSelect
export type RoleRequest = typeof roleRequests.$inferSelect
