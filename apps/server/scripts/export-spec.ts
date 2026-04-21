/**
 * Exports the OpenAPI spec to a JSON file.
 * Run with: bun run scripts/export-spec.ts
 *
 * This imports the app directly from index.ts so the spec always
 * reflects the actual server routes — no duplication.
 */
import { writeFile } from "node:fs/promises";
import { app } from "../src/index";

const OUTPUT_PATH = "./openapi.json";

// Override the port so it doesn't clash with a running dev server
app.listen(3001);

// Give Elysia time to compile routes then fetch the spec
await new Promise((resolve) => setTimeout(resolve, 500));

const res = await fetch("http://localhost:3001/swagger/json");
const spec = await res.json();

await writeFile(OUTPUT_PATH, JSON.stringify(spec, null, 2));
app.stop();

console.log(`✓ OpenAPI spec written to ${OUTPUT_PATH}`);
