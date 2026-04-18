import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { openapi } from '@elysiajs/openapi'

const app = new Elysia()
  .use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }))
  .use(openapi({
    documentation: {
      info: {
        title: 'WineMarket API',
        version: '1.0.0',
        description: 'Multi-vendor wine marketplace platform',
      },
    },
  }))
  .get('/', () => 'Hello from API')

app.listen(3000)
console.log('Server running on http://localhost:3000')
console.log('OpenAPI spec: http://localhost:3000/swagger')