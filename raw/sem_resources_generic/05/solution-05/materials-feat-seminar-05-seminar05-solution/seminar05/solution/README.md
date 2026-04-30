# Seminar 05 – ORM with Drizzle

This seminar focuses on using an SQL database with the **Drizzle ORM** – a type-safe, modern object-relational mapper for TypeScript.  
You’ll build and interact with a database for a **Task Manager app**, based on concepts discussed during the seminar.

---

## 🛠️ Setup

1. Install dependencies  
  ```bash
  npm install
  ```

2. Start a local PostgreSQL database using Docker  
  ```bash
  docker run --detach -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password  -e POSTGRES_DB=database -p 5432:5432 --name pb138-seminar-05 postgres:latest
  ```

3. Copy the environment variable template  
  ```bash
  cp .env.example .env
  ```

---

## ✅ Tasks

### Task 1 – Define Schema

Define your database schemas in:

```
src/db/schema.ts
```

Use `pgTable` from Drizzle to model users, activities, foods, and goals.
If you are short on time just write schemas in the minimalistic fashion.

### Task 2 – Generate Migrations

Generate migration files based on your schema:

```bash
npm run db:generate
```

Explore the generated files in the `./drizlle` folder.

### Task 3 – Apply Migrations

Run the migration to apply schema changes to your database:

```bash
npm run db:migrate
```

This executes `src/db/migrate.ts`.
Use workbench tool like `pgAdmin` to examine the database.

### Task 4 – Seed the Database

Implement the seeding logic in:

```
src/db/seed.ts
```

Then populate the database with test data:

```bash
npm run db:seed
```

### Task 5 – Query the Database

Write sample queries or updates using Drizzle in:

```
src/index.ts
```

Run the script to verify that you get expected data:

```bash
npm run start
```