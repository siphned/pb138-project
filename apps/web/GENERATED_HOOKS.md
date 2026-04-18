# Generated Hooks Guide

Auto-generated TypeScript hooks from OpenAPI spec. DO NOT EDIT files in `src/generated/`.

## Location

```
src/generated/
├── hooks/        # React Query hooks (use these!)
│   ├── useGetProducts.ts
│   ├── usePostProducts.ts
│   ├── usePatchProductsById.ts
│   ├── useDeleteProductsById.ts
│   └── ...
└── clients/      # Raw fetch clients (rarely needed)
    ├── getProducts.ts
    ├── postProducts.ts
    └── ...
```

## Usage Patterns

### Fetch Data (Read)

```tsx
import { useGetProducts } from '@/generated/hooks'

export function ProductList() {
  const { data, isPending, isError, error } = useGetProducts()

  if (isPending) return <div>Loading...</div>
  if (isError) return <div>Error: {error?.message}</div>

  return (
    <ul>
      {data?.map(product => (
        <li key={product.id}>{product.name} - ${product.price}</li>
      ))}
    </ul>
  )
}
```

### Filter Data (Query Parameters)

```tsx
import { useGetProducts } from '@/generated/hooks'

export function FilteredProducts() {
  // Pass query parameters
  const { data } = useGetProducts({
    queryParams: { category: 'red-wine', limit: 10 }
  })

  return <ul>{data?.map(p => <li key={p.id}>{p.name}</li>)}</ul>
}
```

### Create Data (Mutation)

```tsx
import { usePostProducts } from '@/generated/hooks'
import { useQueryClient } from '@tanstack/react-query'

export function CreateProduct() {
  const createProduct = usePostProducts()
  const queryClient = useQueryClient()

  const handleCreate = async () => {
    try {
      const newProduct = await createProduct.mutateAsync({
        name: 'Bordeaux 2020',
        price: 45.99,
        category: 'red-wine',
      })
      
      // Refetch products after creation
      queryClient.invalidateQueries({ queryKey: ['products'] })
      
      console.log('Created:', newProduct)
    } catch (error) {
      console.error('Failed:', error)
    }
  }

  return (
    <button onClick={handleCreate} disabled={createProduct.isPending}>
      {createProduct.isPending ? 'Creating...' : 'Add Product'}
    </button>
  )
}
```

### Update Data (Patch)

```tsx
import { usePatchProductsById } from '@/generated/hooks'

export function UpdatePrice({ productId }: { productId: string }) {
  const updateProduct = usePatchProductsById()

  return (
    <button
      onClick={() =>
        updateProduct.mutate({
          pathParams: { id: productId },
          body: { price: 49.99 },
        })
      }
    >
      Update Price
    </button>
  )
}
```

### Delete Data

```tsx
import { useDeleteProductsById } from '@/generated/hooks'

export function DeleteButton({ productId }: { productId: string }) {
  const deleteProduct = useDeleteProductsById()

  return (
    <button
      onClick={() =>
        deleteProduct.mutate({
          pathParams: { id: productId },
        })
      }
    >
      Delete
    </button>
  )
}
```

## React Query Features

All hooks are built on **TanStack Query**, giving you:

- **Automatic caching** — request results cached by default
- **Background refetching** — keep data fresh
- **Retry logic** — automatic retries on failure
- **Loading/Error states** — `isPending`, `isError`, `error`
- **Manual refetching** — `refetch()` method
- **Mutations** — `mutate()` for write operations

```tsx
const { data, isPending, refetch } = useGetProducts()

// Manually refetch
const handleRefresh = () => refetch()

// Mutation with callbacks
const { mutate, isPending } = usePostProducts({
  onSuccess: (data) => {
    console.log('Created:', data)
  },
  onError: (error) => {
    console.error('Failed:', error)
  },
})
```

## Regenerating Hooks

When backend routes change:

```bash
# From project root
bun run generate

# Or from apps/web
bun run generate
```

Kubb reads the OpenAPI spec and regenerates hooks. You might need to:

1. Update imports if endpoint names changed
2. Update prop shapes if request/response changed
3. Fix TypeScript errors (intentional — types caught breaking changes!)

## Type Safety

Hooks are fully typed:

```tsx
const { data } = useGetProducts()
// data: Product[] | undefined

const { mutate } = usePostProducts()
// mutate expects: { name: string, price: number, category: string }

// TypeScript error if you pass wrong shape:
mutate({ name: 'Wine', price: 'not a number' }) // ❌ TS Error
mutate({ name: 'Wine', price: 29.99 }) // ✅ OK
```

## Naming Convention

Hook names follow API routes:

| HTTP Route | Hook Name |
|---|---|
| `GET /api/products` | `useGetProducts()` |
| `GET /api/products/:id` | `useGetProductsById()` |
| `POST /api/products` | `usePostProducts()` |
| `PATCH /api/products/:id` | `usePatchProductsById()` |
| `DELETE /api/products/:id` | `useDeleteProductsById()` |

## Common Patterns

### Conditional Fetching

```tsx
const [shouldFetch, setShouldFetch] = useState(false)

const { data } = useGetProducts(
  {}, 
  { enabled: shouldFetch } // Only fetch when true
)
```

### Dependent Queries

```tsx
const { data: products } = useGetProducts()

const { data: reviews } = useGetProductReviews(
  { pathParams: { id: products?.[0]?.id ?? '' } },
  { enabled: !!products?.[0]?.id } // Wait for product to load
)
```

### Cache Invalidation

```tsx
const queryClient = useQueryClient()
const { mutate } = usePostProducts({
  onSuccess: () => {
    // Refetch all products after creating one
    queryClient.invalidateQueries({ queryKey: ['products'] })
  },
})
```

## Debugging

Enable React Query DevTools:

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function App() {
  return (
    <>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}
```

Click the floating DevTools icon to inspect:
- Active queries and their state
- Cache contents
- Query history
- Network requests
