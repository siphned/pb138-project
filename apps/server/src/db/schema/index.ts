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
import type { products } from './catalog'
import type { orders } from './orders'
import type { carts } from './carts'
import type { roleRequests } from './role-requests'

export type User = (typeof users)['$inferSelect']
export type NewUser = (typeof users)['$inferInsert']
export type Address = (typeof addresses)['$inferSelect']
export type NewAddress = (typeof addresses)['$inferInsert']
export type Shop = (typeof shops)['$inferSelect']
export type Winemaker = (typeof winemakers)['$inferSelect']
export type Product = (typeof products)['$inferSelect']
export type Order = (typeof orders)['$inferSelect']
export type Cart = (typeof carts)['$inferSelect']
export type RoleRequest = (typeof roleRequests)['$inferSelect']
