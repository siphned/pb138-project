/**
 * Exports the OpenAPI spec to a JSON file.
 * Run with: bun run generate (or bun run scripts/export-spec.ts)
 *
 * This imports the app directly so the spec always reflects actual routes.
 * Also normalizes Zod v4 schema quirks to valid OpenAPI 3.0:
 *   - anyOf + {type:"null"} → nullable: true
 *   - anyOf + {type:"Date"} → removes the non-standard entry
 */
import { writeFile } from "node:fs/promises";
import { app } from "../src/app";

const OUTPUT_PATH = "./openapi.json";

// biome-ignore lint/suspicious/noExplicitAny: OpenAPI spec traversal uses unknown shape
type AnyNode = any;

function isInvalidType(s: AnyNode): boolean {
  return s && (s.type === "Date" || s.type === "null");
}

function resolveAnyOf(processed: AnyNode): AnyNode {
  const hasDate = processed.anyOf.some((s: AnyNode) => s?.type === "Date");
  const hasNull = processed.anyOf.some((s: AnyNode) => s?.type === "null");
  if (!(hasDate || hasNull)) return processed;

  const cleaned = processed.anyOf.filter((s: AnyNode) => !isInvalidType(s));
  const { anyOf: _anyOf, ...rest } = processed;
  const nullable = hasNull ? { nullable: true } : {};

  if (cleaned.length === 0) return { ...rest, format: "date-time", type: "string", ...nullable };
  if (cleaned.length === 1) return { ...rest, ...cleaned[0], ...nullable };
  return { ...rest, anyOf: cleaned, ...nullable };
}

function normalizeSpec(node: AnyNode): AnyNode {
  if (typeof node !== "object" || node === null) return node;
  if (Array.isArray(node)) return node.map(normalizeSpec);

  const processed = Object.fromEntries(Object.entries(node).map(([k, v]) => [k, normalizeSpec(v)]));
  return Array.isArray(processed.anyOf) ? resolveAnyOf(processed) : processed;
}

// Simulate a request to get the OpenAPI JSON without starting a server
const req = new Request("http://localhost/swagger/json");
const res = await app.handle(req);

if (!res.ok) {
  // biome-ignore lint/suspicious/noConsole: script error reporting requires console output
  console.error(`Failed to fetch OpenAPI spec: ${res.status} ${res.statusText}`);
  process.exit(1);
}

const raw = await res.json();
const normalized = normalizeSpec(raw);

// Inject a fallback response for any operation that still lacks one
// (Orval requires every operation to have at least one response)
const httpMethods = ["get", "post", "put", "patch", "delete", "head", "options"] as const;
for (const pathItem of Object.values(normalized.paths ?? {})) {
  for (const method of httpMethods) {
    // biome-ignore lint/suspicious/noExplicitAny: OpenAPI traversal
    const op = (pathItem as any)[method];
    if (op && !op.responses) {
      op.responses = { "200": { description: "Success" } };
    }
    // 204 No Content must not carry a body
    if (op?.responses?.["204"]) {
      op.responses["204"] = { description: "No Content" };
    }
  }
}
const spec = normalized;

await writeFile(OUTPUT_PATH, JSON.stringify(spec, null, 2));
process.exit(0);
