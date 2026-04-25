import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginClient } from '@kubb/plugin-client'
import { pluginReactQuery } from '@kubb/plugin-react-query'

// Run `bun run generate` in apps/server first to produce openapi.json,
// then run `bun run generate` here (or `turbo generate` from the root).

export default defineConfig({
  root: '.',
  input: {
    path: '../server/openapi.json',
  },
  output: {
    path: './src/generated',
    clean: true,
  },
  plugins: [
    pluginOas({ generators: [] }),

    // 1. Generate TypeScript types for all schemas
    pluginTs({
      output: { path: 'types' },
    }),

    // 2. Generate axios-based fetch functions
    pluginClient({
      output: { path: 'clients' },
      importPath: '../../lib/axios',
    }),

    // 3. Generate TanStack Query hooks (useQuery / useMutation)
    pluginReactQuery({
      output: { path: 'hooks' },
      client: {
        importPath: '../../lib/axios',
      },
    }),
  ],
})
