import { createApp } from '../src/app'

const app = createApp()
app.listen(0)

const port = app.server!.port

const response = await fetch(`http://localhost:${port}/api-docs/json`)
const doc = await response.json()

await Bun.write(
  new URL('../openapi.json', import.meta.url).pathname,
  JSON.stringify(doc, null, 2) + '\n',
)

console.log('OpenAPI spec written to openapi.json')
app.stop()
