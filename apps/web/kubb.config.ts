import { defineConfig } from '@kubb/core'
import { pluginFetch } from '@kubb/plugin-fetch'
import { pluginReactQuery } from '@kubb/plugin-react-query'

export default defineConfig({
  input: {
    path: 'http://localhost:3000/swagger/json',
  },
  output: {
    path: 'src/generated',
  },
  plugins: [
    pluginFetch({
      output: { path: 'clients' },
    }),
    pluginReactQuery({
      output: { path: 'hooks' },
    }),
  ],
})
