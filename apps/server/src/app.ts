import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'
import { usersRoutes } from './modules/users'
import { roleRequestsRoutes } from './modules/role-requests'
import { shopsRoutes } from './modules/shops'
import { productsRoutes } from './modules/products'
import { availabilityRoutes } from './modules/availability'
import { winesRoutes } from './modules/wines'
import { winemakersRoutes } from './modules/winemakers'
import { reviewsRoutes } from './modules/reviews'

export const app = new Elysia()
  .use(cors({ origin: 'http://localhost:5173' }))
  .use(
    openapi({
      provider: 'scalar',
      specPath: '/swagger/json',
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
          { name: 'availability', description: 'Shop availability schedule' },
          { name: 'wines', description: 'Wine catalog CRUD and filtering' },
          { name: 'winemakers', description: 'Winemaker profiles and portfolios' },
          { name: 'reviews', description: 'Product and winemaker reviews & ratings' },
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
  .use(availabilityRoutes)
  .use(winesRoutes)
  .use(winemakersRoutes)
  .use(reviewsRoutes)
