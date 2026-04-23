import { Elysia } from 'elysia'
import { authPlugin } from '../auth'
import { usersService } from './users.service'
import {
  userResponseSchema,
  updateProfileBody,
  addressBody,
  addressesResponseSchema,
  addressResponseSchema,
} from './users.schema'

export const usersRoutes = new Elysia({ prefix: '/users' })
  .use(authPlugin)

  .get(
    '/me',
    async ({ clerkId, clerkPayload }) => {
      const user = await usersService.lazyGetOrCreate(clerkId, clerkPayload)
      return user
    },
    {
      requireAuth: true,
      response: userResponseSchema,
      detail: {
        tags: ['users'],
        summary: 'Get current authenticated user',
        description:
          "Returns the caller's user record. If no local row exists yet, one is lazily created from Clerk profile data on first call.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .put(
    '/me',
    async ({ clerkId, clerkPayload, body }) => {
      return usersService.updateProfile(clerkId, clerkPayload, body)
    },
    {
      requireAuth: true,
      body: updateProfileBody,
      response: userResponseSchema,
      detail: {
        tags: ['users'],
        summary: 'Update current user profile',
        description: 'Updates the first or last name of the authenticated user.',
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .get(
    '/me/addresses',
    async ({ clerkId, clerkPayload }) => {
      return usersService.getAddresses(clerkId, clerkPayload)
    },
    {
      requireAuth: true,
      response: addressesResponseSchema,
      detail: {
        tags: ['users'],
        summary: 'Get current user addresses',
        description: 'Returns the shipping and billing addresses linked to the authenticated user.',
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .post(
    '/me/addresses',
    async ({ clerkId, clerkPayload, body }) => {
      const { type, ...addressData } = body
      return usersService.upsertAddress(clerkId, clerkPayload, type, addressData)
    },
    {
      requireAuth: true,
      body: addressBody,
      response: addressResponseSchema,
      detail: {
        tags: ['users'],
        summary: 'Set a shipping or billing address',
        description:
          'Creates a new address and links it as the shipping or billing address for the authenticated user. Replaces any previously linked address of the same type.',
        security: [{ bearerAuth: [] }],
      },
    }
  )
