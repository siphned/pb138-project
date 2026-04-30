# Databases, ERD & Drizzle ORM

## Entity-Relationship Diagrams (ERD)

**E**ntity-**R**elationship **D**iagram — a visual blueprint of your data model.

- **Entity** = a thing you store (User, Product, Order)
- **Attribute** = a property (name, email, price)
- **Relationship** = how entities connect

```
┌──────────────┐              ┌──────────────┐
│ Student      │ enrolls in   │ Course       │
│──────────────│─────────────>│──────────────│
│ id (PK)      │              │ id (PK)      │
│ name         │              │ name         │
│ email        │              │ credits      │
└──────────────┘              └──────────────┘
```

**Design first, code second.** Changing schemas after launch is painful.

---

## Keys

Every entity needs a way to identify records uniquely.

### Primary Key (PK)
Unique identifier for each row.

```ts
students: {
  id: uuid("id").primaryKey().defaultRandom(),  ← PK
  firstName: text("first_name"),
  email: text("email").unique(),
}
```

### Foreign Key (FK)
Reference to a PK in another table. Enforces **referential integrity**.

```ts
courses: {
  id: uuid("id").primaryKey(),
  name: text("name"),
  instructorId: uuid("instructor_id")  ← FK
    .references(() => instructors.id),  // must exist in instructors table
}
```

### Serial vs UUID

| Aspect | Serial | UUID |
|---|---|---|
| Format | `1, 2, 3, ...` | `550e8400-e29b-41d4-a716-446655440000` |
| Size | 4-8 bytes | 16 bytes |
| Pros | Small, readable | Globally unique, no collisions |
| Cons | Predictable | Larger, less readable |
| Use | Internal systems | APIs, distributed systems |

**We use UUIDs** — better for APIs (can't guess `/users/1`) and distributed systems.

---

## Relationship Cardinality

How many records on each side?

| Type | Example | Schema | Implementation |
|---|---|---|---|
| **1:1** | Student ↔ Profile | One student has one profile | FK on either table (unique) |
| **1:N** | Department → Instructors | One department has many instructors | FK on "many" side |
| **M:N** | Students ↔ Courses | Many students enroll in many courses | Junction table |

### 1:1 Example
```ts
const students = pgTable("students", {
  id: uuid("id").primaryKey(),
  name: text("name"),
})

const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  studentId: uuid("student_id")
    .references(() => students.id)
    .unique(),  // only one profile per student
})
```

### 1:N Example
```ts
const departments = pgTable("departments", {
  id: uuid("id").primaryKey(),
  name: text("name"),
})

const instructors = pgTable("instructors", {
  id: uuid("id").primaryKey(),
  name: text("name"),
  departmentId: uuid("department_id")  // FK
    .references(() => departments.id),  // many instructors per dept
})
```

### M:N Example (Junction Table)
```ts
const students = pgTable("students", { ... })
const courses = pgTable("courses", { ... })

const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey(),
  studentId: uuid("student_id")
    .references(() => students.id),
  courseId: uuid("course_id")
    .references(() => courses.id),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
})
// Can also add data: grade, role, etc.
```

---

## PostgreSQL + Docker

Running a database locally:

```bash
docker compose up -d  # start from docker-compose.yml
```

```yaml
# docker-compose.yml (in project root)
# Run from project root: docker compose up -d
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
```

**Connection string:**
```
postgresql://postgres:postgres@localhost:5432/myapp
│            │        │         │         │    │
protocol     user     password  host      port database
```

Store in `.env`:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/myapp"
```

---

## Drizzle ORM

**TypeScript-first SQL toolkit** — schema in code, not migrations.

```ts
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle(process.env.DATABASE_URL);

const users = await db.select().from(students);
// users: Student[] — fully typed!
```

---

## Defining Schemas

Tables are plain TypeScript — this IS your source of truth.

```ts
import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";

export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  uco: text("uco").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  semester: text("semester"),  // nullable
  instructorId: uuid("instructor_id")
    .references(() => instructors.id),
});

export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id),
});
```

**Naming convention:** DB columns use `snake_case`, TypeScript uses `camelCase` — Drizzle maps automatically.

---

## Queries — Basic Operations

### SELECT

```ts
import { eq, gte, and, or } from "drizzle-orm";

// SELECT * FROM students
const all = await db.select().from(students);

// SELECT * FROM students WHERE email = 'alice@mail.com'
const one = await db
  .select()
  .from(students)
  .where(eq(students.email, "alice@mail.com"));

// SELECT * FROM courses WHERE credits >= 3 AND semester = 'spring'
const filtered = await db
  .select()
  .from(courses)
  .where(
    and(
      gte(courses.credits, 3),
      eq(courses.semester, "spring")
    )
  );

// SELECT * FROM courses ORDER BY name LIMIT 10
const sorted = await db
  .select()
  .from(courses)
  .orderBy(courses.name)
  .limit(10);
```

### INSERT

```ts
const [newStudent] = await db
  .insert(students)
  .values({
    firstName: "Alice",
    lastName: "Nováková",
    email: "alice@mail.com",
    uco: "123456",
  })
  .returning();  // get back the created row
```

### UPDATE

```ts
await db
  .update(students)
  .set({ email: "new@mail.com" })
  .where(eq(students.id, studentId));
```

### DELETE

```ts
await db
  .delete(students)
  .where(eq(students.id, studentId));
```

---

## Queries — Joins

```ts
// SELECT s.first_name, c.name FROM students s
// JOIN enrollments e ON e.student_id = s.id
// JOIN courses c ON e.course_id = c.id

const result = await db
  .select({
    studentName: students.firstName,
    courseName: courses.name,
  })
  .from(students)
  .innerJoin(
    enrollments,
    eq(enrollments.studentId, students.id)
  )
  .innerJoin(
    courses,
    eq(enrollments.courseId, courses.id)
  );

// result: { studentName: string; courseName: string }[]
```

---

## Query API (ORM-Like)

Closer to Prisma — declare what you want, Drizzle handles joins:

```ts
// Find all courses with optional filtering
const allCourses = await db.query.courses.findMany({
  where: eq(courses.semester, "spring"),
  orderBy: [asc(courses.name)],
  limit: 10,
});

// Find one student
const student = await db.query.students.findFirst({
  where: eq(students.uco, "123456"),
});

// Load related entities (no manual joins!)
const coursesWithInstructor = await db.query.courses.findMany({
  with: {
    instructor: true,  // auto-joins instructors table
  },
});
// { id, name, credits, instructor: { id, firstName, ... } }[]
```

---

## Migrations

Track schema changes as you evolve your data model.

```bash
# 1. Generate migration from schema changes
bunx drizzle-kit generate

# 2. Apply migrations to database
bunx drizzle-kit migrate

# 3. Browse database visually
bunx drizzle-kit studio
```

Drizzle Kit compares your schema code to the DB and generates SQL automatically.

```
drizzle/
├── 0000_initial.sql         ← CREATE TABLE students ...
├── 0001_add_courses.sql     ← CREATE TABLE courses ...
└── 0002_add_enrollments.sql ← CREATE TABLE enrollments ...
```

**Commit migrations to git** — they're your database changelog.

---

## Transactions

Multiple operations that must succeed or fail **together**.

```ts
// Enroll a student in multiple courses — all or nothing
await db.transaction(async (tx) => {
  for (const courseId of courseIds) {
    await tx.insert(enrollments).values({
      studentId,
      courseId,
    });
  }
});
```

If any insert fails (e.g., duplicate enrollment), **all are rolled back**. Without transactions, the student could end up partially enrolled — inconsistent state.

---

## Serializable Transactions

Prevents **read-then-write race conditions**.

```ts
// Problem: two concurrent requests both read "29/30 enrolled"
// both insert, now we have "31/30" — over capacity!

await db.transaction(
  async (tx) => {
    const course = await coursesRepository.findById(tx, courseId);
    const enrolled = await enrollmentsRepository.countByCourse(
      tx,
      courseId
    );

    // Check capacity
    if (enrolled >= course.capacity) {
      throw new Error("Course is full");
    }

    // Drop old enrollment, add new one
    await enrollmentsRepository.deleteEnrollment(tx, studentId, oldCourseId);
    await enrollmentsRepository.createEnrollment(tx, studentId, courseId);
  },
  { isolationLevel: "serializable" }  // ← critical!
);
```

**Serializable** isolation forces the DB to detect conflicts and retry/abort. Without it, race conditions leak through.

---

## Soft Delete

Instead of `DELETE`, mark as deleted. Data stays recoverable, FKs stay intact.

```ts
// Schema
const courses = pgTable("courses", {
  id: uuid("id").primaryKey(),
  name: text("name"),
  deletedAt: timestamp("deleted_at"),  // nullable
});

// Soft delete
await db
  .update(courses)
  .set({ deletedAt: new Date() })
  .where(eq(courses.id, courseId));

// Always filter in queries
const active = await db
  .select()
  .from(courses)
  .where(isNull(courses.deletedAt));
```

---

## Repository Pattern

Separate data access from business logic.

```ts
// repository — pure data access
export const studentsRepository = {
  findAll: (db: Database) =>
    db.select().from(students),

  findById: (db: Database, id: string) =>
    db
      .select()
      .from(students)
      .where(eq(students.id, id))
      .then((rows) => rows[0]),

  create: (db: Database, data: CreateStudentInput) =>
    db
      .insert(students)
      .values(data)
      .returning()
      .then((rows) => rows[0]),
};

// service — owns transaction logic
export const studentsService = {
  bulkEnroll: async (data: BulkEnrollInput) => {
    return db.transaction(async (tx) => {
      for (const courseId of data.courseIds) {
        await enrollmentsRepository.create(tx, {
          studentId: data.studentId,
          courseId,
        });
      }
    });
  },
};
```

**Why?** Repository receives `db` or `tx` as a parameter. Service owns transaction logic. Easy to test, easy to reuse.

---

## ORM vs Query Builder Spectrum

```
Raw SQL ────────────────────── Query Builder ────────────────────── ORM
 ↑                                    ↑                                ↑
 Full control                    Type-safe SQL                      Magic
 No safety                       Composable                          Heavy
 e.g., pg driver                 e.g., Drizzle                       e.g., Prisma, TypeORM
```

**Drizzle = query builder first**, with optional ORM-like relational API. You control the SQL conceptually, get type safety without magic.

---

## Related Pages

- [REST_API.md](REST_API.md) — API design for database resources
- [ELYSIA.md](ELYSIA.md) — Connecting Elysia handlers to Drizzle queries
- [ROUTING.md](ROUTING.md) — Loading related data in route loaders
