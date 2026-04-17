import { Elysia } from 'elysia'
import { usersRoutes } from './modules/users'
import { roleRequestsRoutes } from './modules/role-requests'

export const app = new Elysia()
  .use(usersRoutes)
  .use(roleRequestsRoutes)
