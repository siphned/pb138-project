# Elysia Framework

## What is Elysia?

- **Modern, ergonomic** web framework built for **Bun**
- **End-to-end type safety** — routes, params, body, response all typed
- Built-in plugin system (CORS, OpenAPI, etc.)
- Supports **Zod** validation via Standard Schema
- No setup overhead — just return objects, not `res.json()`

```ts
import { Elysia } from 'elysia'

const app = new Elysia()

app.get('/api/health', () => {
  return { status: 'ok' }
})

app.listen(3000)
```

Compare to Express:
```js
// Express
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})
```

---

## Route Handlers

### Basic Routes

```ts
const app = new Elysia()

// GET all
app.get('/api/products', () => {
  return products
})

// GET one
app.get('/api/products/:id', ({ params: { id }, set }) => {
  const product = products.find(p => p.id === id)
  if (!product) {
    set.status = 404
    return { error: 'Not found' }
  }
  return product
})

// POST — create
app.post('/api/products', ({ body }) => {
  const product = { id: crypto.randomUUID(), ...body }
  products.push(product)
  return product
})

// PUT — replace
app.put('/api/products/:id', ({ params: { id }, body, set }) => {
  const idx = products.findIndex(p => p.id === id)
  if (idx === -1) {
    set.status = 404
    return { error: 'Not found' }
  }
  products[idx] = body
  return products[idx]
})

// DELETE
app.delete('/api/products/:id', ({ params: { id }, set }) => {
  products = products.filter(p => p.id !== id)
  set.status = 204
})
```

**Key difference from Express:**
- Destructure what you need from the context
- Return objects directly (no `res.json()`)
- Set status via `set.status`

---

## Request Context

The handler receives a context object with everything you need:

```ts
app.post('/api/products', (context) => {
  // Destructure what you use
  const { body, params, headers, query, set, request } = context

  // body — parsed JSON from request
  const { name, price } = body

  // params — path parameters (/products/:id)
  const { id } = params

  // query — URL query string (?sort=name&page=2)
  const { sort, page } = query

  // headers — HTTP headers
  const auth = headers.authorization

  // set — set response properties
  set.status = 201
  set.headers['X-Custom-Header'] = 'value'

  // request — the raw fetch Request object
  const method = request.method

  return { success: true }
})
```

---

## Validation with Zod

Pass a Zod schema in the config object. Elysia validates automatically.

```ts
import { z } from 'zod'

const CreateProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  category: z.enum(['electronics', 'clothing', 'food']),
})

app.post('/api/products', ({ body }) => {
  // body is now fully typed and validated
  const product = { id: crypto.randomUUID(), ...body }
  return product
}, {
  body: CreateProductSchema,
})

// If validation fails → 400 status automatically
```

**Result:**
- Types inferred from Zod schema
- Validation done automatically
- Invalid input → 400 response
- Request body is typed and safe

---

## Middleware & Hooks

Every request flows through a **lifecycle chain**:

```
Request
  │
  ├─ onRequest
  ├─ onBeforeHandle (guards, can short-circuit)
  ├─ derive (enrich context)
  ├─ Handler executes
  ├─ onAfterHandle
  └─ onResponse
```

### Guard — Authentication Example

```ts
app.onBeforeHandle(({ set, headers }) => {
  // Return a value to short-circuit the chain
  if (!headers.authorization) {
    set.status = 401
    return { error: 'Login required' }
  }
})
```

### Derive — Enriching Context

```ts
app.derive(({ headers }) => {
  const token = headers.authorization?.replace('Bearer ', '')
  const user = getUserFromToken(token)
  
  // Returns are merged into context for handlers below
  return { currentUser: user }
})

app.get('/api/profile', ({ currentUser }) => {
  // currentUser is fully typed, passed by derive
  return currentUser
})
```

### Logging Example

```ts
app.onRequest(({ method, url }) => {
  console.log(`[${method}] ${url}`)
})

app.onAfterHandle(({ response }) => {
  console.log(`Response: ${response.status}`)
})
```

---

## Plugins & Modularization

`.use()` merges an entire Elysia instance (plugin) into your app.

```ts
// modules/products.ts — self-contained module
export const products = new Elysia({ 
  prefix: '/products',
  tags: ['Products']
})
  .get('/', () => {
    return allProducts()
  })
  .post('/', ({ body }) => {
    return createProduct(body)
  }, {
    body: CreateProductSchema
  })

// modules/students.ts — another module
export const students = new Elysia({
  prefix: '/students',
  tags: ['Students']
})
  .get('/', () => allStudents())
  .post('/', ({ body }) => createStudent(body), {
    body: CreateStudentSchema
  })

// index.ts — compose everything
const app = new Elysia()
  .use(cors())          // built-in plugin
  .use(openapi())       // OpenAPI spec generation
  .use(products)        // your module: GET /products, POST /products
  .use(students)        // your module: GET /students, POST /students
  .listen(3000)
```

**Benefits:**
- Split concerns — each module manages its own routes
- Composable — mix and match
- Reusable — move modules between projects
- Type-safe — full inference across modules

---

## Elysia + Zod = Single Source of Truth

One Zod schema provides types + validation + OpenAPI docs:

```ts
import { z } from 'zod'

const CreateProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  category: z.enum(['electronics', 'clothing', 'food']),
})

// 1. TypeScript type is inferred
type CreateProduct = z.infer<typeof CreateProductSchema>

// 2. Elysia uses it for validation
app.post('/api/products', ({ body }) => {
  // body: CreateProduct — fully typed!
  return body
}, {
  body: CreateProductSchema,  // Elysia validates this
})

// 3. OpenAPI spec is generated automatically
// (with @elysiajs/openapi plugin)
```

Compare to Express (separate concerns):
```js
// Express — you maintain 3 separate things
interface CreateProduct {
  name: string
  price: number
  category: 'electronics' | 'clothing' | 'food'
}

const schema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  category: z.enum(['electronics', 'clothing', 'food']),
})

app.post('/api/products', (req, res) => {
  const result = schema.safeParse(req.body)
  if (!result.success) return res.status(400).json(result.error)
  // and then manually document this in OpenAPI...
})
```

**Elysia wins:** One source, three benefits.

---

## Status Codes

Set status in handlers:

```ts
app.post('/api/products', ({ set, body }) => {
  const product = { id: crypto.randomUUID(), ...body }
  set.status = 201  // Created
  return product
})

app.delete('/api/products/:id', ({ params: { id }, set }) => {
  deleteProduct(id)
  set.status = 204  // No Content
})

app.get('/api/products/:id', ({ params: { id }, set }) => {
  const product = findProduct(id)
  if (!product) {
    set.status = 404
    return { error: 'Not found' }
  }
  return product
})
```

---

## Error Handling

### Graceful Error Responses

```ts
app.post('/api/products', ({ body, set }) => {
  try {
    const product = createProduct(body)
    set.status = 201
    return product
  } catch (err) {
    set.status = 500
    return { error: err.message }
  }
})

// Elysia also lets you throw errors
app.get('/api/products/:id', ({ params: { id }, set }) => {
  const product = findProduct(id)
  if (!product) {
    throw new Error('Not found')  // caught automatically
  }
  return product
})
```

---

## CORS Plugin

```ts
import { cors } from '@elysiajs/cors'

const app = new Elysia()
  .use(cors({
    origin: 'http://localhost:5173',  // your frontend
    credentials: true,                 // allow cookies/auth headers
  }))
  .listen(3000)
```

Without CORS, browsers block cross-origin requests by default. The plugin adds `Access-Control-Allow-Origin` headers so browsers allow the request.

---

## Debugging & Devtools

```ts
app.get('/api/test', () => {
  console.log('Handler running!')
  return { success: true }
})

app.onRequest((context) => {
  console.log(`[${context.request.method}] ${context.request.url}`)
})
```

Run with `bun run --inspect` for Chrome DevTools support.

---

## Comparison: Express vs Elysia

| Feature | Express | Elysia |
|---|---|---|
| **Setup** | `app.use(express.json())` | None, automatic |
| **Type safety** | Manual interfaces | Inferred from Zod |
| **Validation** | Manual `safeParse` in every handler | Pass schema, done |
| **OpenAPI** | Separate tool / manual | Built-in generator |
| **DX** | `(req, res, next)` callbacks | Destructure context, return objects |
| **Runtime** | Node.js / Bun / Deno | Bun |
| **Status codes** | `res.status(200).json()` | `set.status = 200; return {}` |

---

## Related Pages

- [REST_API.md](REST_API.md) — HTTP concepts that Elysia uses
- [KUBB.md](KUBB.md) — Generating typed clients from Elysia + Zod routes
- [DATABASE.md](DATABASE.md) — Connecting Elysia handlers to Drizzle queries
