# Server image — also reused for the `migrate` and `seed` compose services.
# Bun runs the TypeScript entrypoint directly (same as render.yaml).
FROM oven/bun:1.3.11-alpine
WORKDIR /app

ENV NODE_ENV=production

# --- Dependency layer (cached unless any manifest/lockfile changes) ---
# Copy every workspace manifest so `bun install` can resolve the workspace graph.
COPY package.json bun.lock ./
COPY apps/server/package.json ./apps/server/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json

# Installs all deps incl. devDeps (drizzle-kit is needed by the migrate service).
RUN bun install --frozen-lockfile

# --- Source layer ---
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

EXPOSE 3000

CMD ["bun", "run", "apps/server/src/index.ts"]
