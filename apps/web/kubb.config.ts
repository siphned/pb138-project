import { defineConfig } from '@kubb/core'
import { pluginClient } from '@kubb/plugin-client'
import { pluginReactQuery } from '@kubb/plugin-react-query'

export default defineConfig({
  input: {
    path: 'http://localhost:3000/swagger/json',
  },
  output: {
    path: 'src/generated',
  },
  plugins: [
    pluginClient({
      output: { path: 'clients' },
    }),
    pluginReactQuery({
      output: { path: 'hooks' },
    }),
  ],
})
