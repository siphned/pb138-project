import { Elysia, status, t } from 'elysia'
import { authPlugin } from '../auth'
import { usersService } from '../users/users.service'
import { roleRequestsService } from './role-requests.service'
import { submitRoleRequestBody, roleRequestResponse } from './role-requests.schema'

export const roleRequestsRoutes = new Elysia()
  .use(authPlugin)

  .post(
    '/users/me/request-winemaker',
    async ({ clerkId, clerkPayload, body }) => {
      const user = await usersService.lazyGetOrCreate(clerkId, clerkPayload)
      try {
        return await roleRequestsService.submitRequest(
          user.id,
          'winemaker',
          body.business_name,
          body.details
        )
      } catch (e: unknown) {
        if (e instanceof Error && e.message === 'DUPLICATE_REQUEST')
          return status(409, 'Pending request already exists')
        throw e
      }
    },
    { requireAuth: true, body: submitRoleRequestBody }
  )

  .post(
    '/users/me/request-shop-owner',
    async ({ clerkId, clerkPayload, body }) => {
      const user = await usersService.lazyGetOrCreate(clerkId, clerkPayload)
      try {
        return await roleRequestsService.submitRequest(
          user.id,
          'shop_owner',
          body.business_name,
          body.details
        )
      } catch (e: unknown) {
        if (e instanceof Error && e.message === 'DUPLICATE_REQUEST')
          return status(409, 'Pending request already exists')
        throw e
      }
    },
    { requireAuth: true, body: submitRoleRequestBody }
  )

  .get(
    '/role-requests',
    () => roleRequestsService.listPending(),
    { requireRole: 'admin' }
  )

  .post(
    '/role-requests/:id/approve',
    async ({ params, clerkId, clerkPayload }) => {
      const admin = await usersService.lazyGetOrCreate(clerkId, clerkPayload)
      try {
        await roleRequestsService.approve(params.id, admin.id)
        return { success: true }
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === 'NOT_FOUND') return status(404, 'Role request not found')
          if (e.message === 'NOT_PENDING') return status(409, 'Request is not pending')
        }
        throw e
      }
    },
    { requireRole: 'admin', params: t.Object({ id: t.String() }) }
  )

  .post(
    '/role-requests/:id/reject',
    async ({ params, clerkId, clerkPayload }) => {
      const admin = await usersService.lazyGetOrCreate(clerkId, clerkPayload)
      try {
        await roleRequestsService.reject(params.id, admin.id)
        return { success: true }
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === 'NOT_FOUND') return status(404, 'Role request not found')
          if (e.message === 'NOT_PENDING') return status(409, 'Request is not pending')
        }
        throw e
      }
    },
    { requireRole: 'admin', params: t.Object({ id: t.String() }) }
  )
