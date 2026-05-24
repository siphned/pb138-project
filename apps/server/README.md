# server

## Local Development

1. **Start Database**:
   ```bash
   docker compose up -d
   ```

2. **Setup Environment**:
   Copy `.env.example` to `.env` and adjust if needed.
   See [Clerk Setup](../../docs/CLERK_SETUP.md) for more details.
   ```bash
   cp .env.example .env
   ```

3. **Install dependencies**:
   ```bash
   bun install
   ```

4. **Run migrations**:
   ```bash
   bun run db:migrate
   ```

5. **Seed database** (optional):
   ```bash
   bun run db:seed
   ```

6. **Start server**:
   ```bash
   bun run dev
   ```

## Tech Stack
- **Framework**: ElysiaJS
- **Runtime**: Bun
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Validation**: Zod
