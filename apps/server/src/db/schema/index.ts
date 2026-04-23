export * from './enums'
export * from './addresses'
export * from './users'
export * from './sellers'
export * from './catalog'
export * from './availability'
export * from './carts'
export * from './events'
export * from './orders'
export * from './reviews'
export * from './images'
export * from './role-requests'
export * from './relations'

// ─── Inferred types ───────────────────────────────────────────────────────────

import type { users } from './users'
import type { addresses } from './addresses'
import type { shops, winemakers } from './sellers'
import type { wines, products, productWines } from './catalog'
import type { availabilityRegular, availabilityExceptions } from './availability'
import type { orders } from './orders'
import type { carts } from './carts'
import type { roleRequests } from './role-requests'

export type User = (typeof users)['$inferSelect']
export type NewUser = (typeof users)['$inferInsert']
export type Address = (typeof addresses)['$inferSelect']
export type NewAddress = (typeof addresses)['$inferInsert']
export type Shop = (typeof shops)['$inferSelect']
export type Winemaker = (typeof winemakers)['$inferSelect']
export type Wine = (typeof wines)['$inferSelect']
export type Product = (typeof products)['$inferSelect']
export type Order = (typeof orders)['$inferSelect']
export type Cart = (typeof carts)['$inferSelect']
export type RoleRequest = (typeof roleRequests)['$inferSelect']
export type ProductWine = (typeof productWines)['$inferSelect']
export type NewProduct = (typeof products)['$inferInsert']
export type NewProductWine = (typeof productWines)['$inferInsert']
export type AvailabilityRegular = (typeof availabilityRegular)['$inferSelect']
export type AvailabilityException = (typeof availabilityExceptions)['$inferSelect']

import type { events, eventRegistrations, comments } from './events'
export type Event = (typeof events)['$inferSelect']
export type NewEvent = (typeof events)['$inferInsert']
export type EventRegistration = (typeof eventRegistrations)['$inferSelect']
export type Comment = (typeof comments)['$inferSelect']
