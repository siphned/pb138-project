# ---------- build stage ----------
FROM oven/bun:1.3.11-alpine AS build
WORKDIR /app

# Dependency layer
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/server/package.json ./apps/server/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
RUN bun install --frozen-lockfile

# Source layer (server is needed to regenerate the OpenAPI spec the client is built from)
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server
COPY apps/web ./apps/web

# Vite bakes these into the bundle at build time.
ARG VITE_API_URL
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# 1) Export OpenAPI spec (no DB needed: export-spec sets NODE_ENV=test when DATABASE_URL absent)
RUN bun run --cwd apps/server generate
# 2) Generate the typed Kubb client into apps/web/src/generated
RUN bun run --cwd apps/web generate
# 3) Build the SPA -> apps/web/dist
RUN bun run --cwd apps/web build

# ---------- serve stage ----------
FROM nginx:alpine AS serve
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
