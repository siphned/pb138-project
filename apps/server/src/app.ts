import { Elysia } from 'elysia'
import { openapi } from '@elysiajs/openapi'
import { usersRoutes } from './modules/users'
import { roleRequestsRoutes } from './modules/role-requests'
import { shopsRoutes } from './modules/shops'
import { productsRoutes } from './modules/products'

export const app = new Elysia()
  .use(
    openapi({
      provider: 'scalar',
      documentation: {
        info: {
          title: 'WineMarket API',
          version: '0.1.0',
          description:
            'Backend API for the WineMarket platform.',
        },
        tags: [
          { name: 'users', description: 'Authenticated user profile endpoints' },
          { name: 'role-requests', description: 'Winemaker/shop-owner role application flow' },
          { name: 'shops', description: 'Shop management' },
          { name: 'products', description: 'Products and bundles' },
        ],
        servers: [{ url: 'http://localhost:3000', description: 'Development' }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'Clerk-issued JWT sent as `Authorization: Bearer <token>`',
            },
          },
        },
      },
    })
  )
  .use(usersRoutes)
  .use(roleRequestsRoutes)
  .use(shopsRoutes)
  .use(productsRoutes)
