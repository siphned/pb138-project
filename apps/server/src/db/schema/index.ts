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

import { users } from './users'
import { shops, winemakers } from './sellers'
import { products, wines } from './catalog'
import { orders } from './orders'
import { carts } from './carts'
import { roleRequests } from './role-requests'

export type User = (typeof users)['$inferSelect']
export type NewUser = (typeof users)['$inferInsert']
export type Shop = (typeof shops)['$inferSelect']
export type Winemaker = (typeof winemakers)['$inferSelect']
export type Product = (typeof products)['$inferSelect']
export type Order = (typeof orders)['$inferSelect']
export type Cart = (typeof carts)['$inferSelect']
export type RoleRequest = (typeof roleRequests)['$inferSelect']
