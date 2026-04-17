import { Elysia } from 'elysia'
import { usersRoutes } from './modules/users'

export const app = new Elysia()
  .use(usersRoutes)
