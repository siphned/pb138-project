import { Elysia } from 'elysia'
import { authPlugin } from '../auth'
import { usersService } from './users.service'
import { userResponseSchema } from './users.schema'

export const usersRoutes = new Elysia({ prefix: '/auth' })
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
          'Returns the caller\'s user record. If no local row exists yet, one is lazily created from Clerk profile data on first call.',
        security: [{ bearerAuth: [] }],
      },
    }
  )
