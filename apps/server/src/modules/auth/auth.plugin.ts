import { Elysia } from 'elysia'
import { verifyClerkToken } from './auth.utils'
import type { ClerkPayload } from './auth.utils'

export type { ClerkPayload }
export type AppRole = 'user' | 'admin' | 'winemaker' | 'shop_owner'

export const authPlugin = new Elysia({ name: 'auth' })
  .macro({
    requireAuth: {
      async resolve({ headers, status }) {
        const payload = await verifyClerkToken(headers.authorization)
        if (!payload) return status(401)

        return {
          clerkId: payload.sub,
          clerkPayload: payload,
        }
      },
    },

    requireRole: (role: 'admin') => ({
      async resolve({ headers, status }) {
        const payload = await verifyClerkToken(headers.authorization)
        if (!payload) return status(401)
        if (payload.role !== role) return status(403)

        return {
          clerkId: payload.sub,
          clerkPayload: payload,
        }
      },
    }),

    requireCapability: (capability: 'winemaker' | 'shop_owner') => ({
      async resolve({ headers, status }) {
        const payload = await verifyClerkToken(headers.authorization)
        if (!payload) return status(401)

        const hasCapability =
          capability === 'winemaker'
            ? payload.is_winemaker === true
            : payload.is_shop_owner === true

        if (!hasCapability) return status(403)

        return {
          clerkId: payload.sub,
          clerkPayload: payload,
        }
      },
    }),
  })
