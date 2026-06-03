FROM oven/bun:1.3.11-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package.json bun.lock ./
COPY apps/server/package.json ./apps/server/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json

RUN bun install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

EXPOSE 3000

CMD ["bun", "run", "apps/server/src/index.ts"]
