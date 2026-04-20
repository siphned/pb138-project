# TanStack Router & App Architecture

## Why Routing?

Your app has multiple pages. Your **URL should reflect that**.

### The Problem Without Routing

```tsx
function App() {
  return (
    <div>
      <StudentsPage />
      <CoursesPage />
    </div>
  );
}
```

- **No URLs** — you can't link to `/students`
- **No navigation** — everything renders at once
- **No browser history** — back/forward buttons don't work
- **No sharing** — can't send someone a link to a specific page

---

## What is Client-Side Routing?

**Maps URLs to components** — without a full page reload.

```
/                      → <HomePage />
/students              → <StudentsPage />
/courses               → <CoursesPage />
/courses/abc123        → <CourseDetailPage id="abc123" />
```

Still a single-page app (SPA) — no server round-trip. Just browser URL changes and the right component renders.

---

## Anatomy of a URL

```
https://example.com /courses/123/enrollments ?semester=spring&page=2
                    ──────────────────────── ───────────────────────
                            path                  search params
                       (route + params)           (query string)
```

### Path Parameters
Dynamic segments that identify **which resource**.

```
/courses/$id/enrollments   ← /courses/123/enrollments
           ^^^ path param

// In component:
const { id } = Route.useParams()
```

### Search Parameters
Filters, sorting, pagination — **how to display the data**.

```
/courses?semester=spring&page=2
         ─────────────────────── search params

// In component:
const { semester, page } = Route.useSearch()
```

---

## TanStack Router

**Type-safe client-side routing library** — routes and params fully typed.

### Why TanStack Router over React Router?

| Feature | React Router | TanStack Router |
|---|---|---|
| **Type-safe params** | strings only | fully typed |
| **Type-safe search params** | manual parsing | Zod validation |
| **Data loading** | partial | built-in loaders |
| **File-based routing** | no | yes (via plugin) |
| **Devtools** | no | yes |
| **DX** | string concatenation | autocomplete everywhere |

**The real problem:** With React Router, typos hide until a user clicks a broken link.

```tsx
// React Router — error at runtime
<Link to={"/cousres/" + id}>  // typo! blank page

// TanStack Router — error at compile time
<Link to="/courses/$id" params={{ id }}>  // ✅ TS error if typo
```

---

## File-Based Routing

Routes are defined by **file system structure**. The `@tanstack/router-plugin` generates the route tree automatically.

```
src/routes/
├── __root.tsx                ← Root layout (navbar, footer)
├── index.tsx                 ← /
├── about.tsx                 ← /about
├── students.tsx              ← /students
├── courses/
│   ├── route.tsx             ← /courses layout
│   ├── index.tsx             ← /courses
│   └── $id.tsx               ← /courses/$id
```

**Conventions:**
- `$` = dynamic segment (param)
- `__root` = root layout (wraps everything)
- `route.tsx` in folder = layout for children
- `index.tsx` = page content
- `_` prefix = pathless layout (ignored by router)

---

## Setup

```bash
npm install @tanstack/react-router @tanstack/router-plugin
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [tanstackRouter(), react()],
});
```

The plugin watches `src/routes/` and auto-generates `routeTree.gen.ts`.

---

## Creating Routes

Each route file exports a `Route` using `createFileRoute`:

```tsx
// src/routes/__root.tsx — Root layout
import { Outlet, Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/__root")({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen">
      <nav className="border-b p-4">
        <Link to="/">Home</Link>
        <Link to="/students">Students</Link>
        <Link to="/courses">Courses</Link>
      </nav>
      <main className="p-6">
        <Outlet />  {/* Child routes render here */}
      </main>
    </div>
  );
}
```

```tsx
// src/routes/index.tsx — Home page
export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return <h1>Welcome</h1>;
}
```

```tsx
// src/routes/students.tsx — Students page
export const Route = createFileRoute("/students")({
  component: StudentsPage,
});

function StudentsPage() {
  return <h1>Students</h1>;
}
```

---

## Navigation

### `<Link>` Component

```tsx
import { Link } from "@tanstack/react-router";

// Basic link
<Link to="/">Home</Link>

// With path params — fully typed!
<Link to="/courses/$id" params={{ id: course.id }}>
  {course.name}
</Link>

// With search params
<Link to="/courses" search={{ semester: "spring" }}>
  Spring Courses
</Link>

// Active state
<Link
  to="/students"
  activeProps={{ className: "font-bold text-blue-600" }}
>
  Students
</Link>
```

TypeScript validates `to`, `params`, and `search` at compile time. Wrong route name? TS error.

### Programmatic Navigation

```tsx
function StudentsPage() {
  const navigate = Route.useNavigate();

  const onSubmit = async (data: NewStudent) => {
    const student = await createStudent(data);
    
    // Navigate after create
    navigate({
      to: "/students/$id",
      params: { id: student.id },
    });
  };

  return <form onSubmit={onSubmit}>...</form>;
}
```

---

## Path Parameters

Dynamic segments in URLs.

```tsx
// src/routes/courses/$id.tsx
export const Route = createFileRoute("/courses/$id")({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { id } = Route.useParams();
  // id: string — TypeScript knows this

  const { data: course } = useGetCoursesById(id);
  return <div>{course?.name}</div>;
}
```

---

## Search Parameters

Query strings like `/courses?semester=spring&minCredits=4`.

TanStack Router makes them **validated and typed** via Zod.

```tsx
import { z } from "zod";

export const Route = createFileRoute("/courses")({
  validateSearch: z.object({
    semester: z.enum(["spring", "fall"]).optional(),
    minCredits: z.number().min(1).optional(),
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const { semester, minCredits } = Route.useSearch();
  // semester: "spring" | "fall" | undefined — validated!

  const navigate = Route.useNavigate();

  const setSemester = (s: "spring" | "fall") => {
    navigate({
      search: (prev) => ({ ...prev, semester: s }),
    });
  };

  return (
    <div>
      <SemesterFilter value={semester} onChange={setSemester} />
      <CourseList semester={semester} minCredits={minCredits} />
    </div>
  );
}
```

**Why search params matter:** They survive refresh, are shareable via URL, work with back button.

### Search Params vs useState

```tsx
// ❌ State lost on refresh, not shareable
const [semester, setSemester] = useState<string>();

// ✅ URL is the source of truth, survives refresh
const { semester } = Route.useSearch();
// /courses?semester=spring → send link to friend → same view
```

**Rule of thumb:** If a user would bookmark or share the state → put it in the URL.

---

## Nested Layouts

Layouts let you share UI across groups of routes.

```
__root.tsx                → Root (navbar)
├── students/
│   ├── route.tsx         → Students layout
│   ├── index.tsx         → Students list
│   └── $id.tsx           → Student detail
└── courses/
    ├── route.tsx         → Courses layout
    ├── index.tsx         → Courses list
    └── $id.tsx           → Course detail
```

When navigating `/students` → `/students/123`:
- `__root.tsx` — stays mounted (navbar doesn't re-render)
- `students/route.tsx` — stays mounted (layout doesn't re-render)
- Only child content swaps (index → $id)

```tsx
// src/routes/courses/route.tsx — layout for /courses/*
export const Route = createFileRoute("/courses")({
  component: CoursesLayout,
});

function CoursesLayout() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Courses</h1>
      <Outlet />  {/* /courses or /courses/$id renders here */}
    </div>
  );
}
```

```tsx
// src/routes/courses/index.tsx — the actual page
export const Route = createFileRoute("/courses/")({
  component: CoursesListPage,
});
```

---

## Route Guards

Protect pages with `beforeLoad` — runs before route renders.

```tsx
// src/routes/_authenticated/route.tsx
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const isAuthenticated = checkAuth();

    if (!isAuthenticated) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: () => <Outlet />,
});
```

All child routes under `/_authenticated` inherit the guard. Unauthenticated users are redirected to login.

---

## Data Loading with Loaders

Load data **before** the component renders — no loading spinner.

```tsx
export const Route = createFileRoute("/courses/$id")({
  loader: async ({ params }) => {
    const course = await fetchCourse(params.id);
    return { course };
  },
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { course } = Route.useLoaderData();
  // course is guaranteed to exist — loader ensures it
  return <h1>{course.name}</h1>;
}
```

**With React Query:**
```tsx
import { queryOptions } from "@tanstack/react-query";

const courseQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["courses", id],
    queryFn: () => fetchCourse(id),
  });

export const Route = createFileRoute("/courses/$id")({
  loader: ({ context: { queryClient }, params }) => {
    // Prefetch into React Query cache
    return queryClient.ensureQueryData(
      courseQueryOptions(params.id)
    );
  },
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { id } = Route.useParams();
  // Data is already cached — instant render
  const { data } = useSuspenseQuery(courseQueryOptions(id));
  return <h1>{data.name}</h1>;
}
```

---

## Error Handling

```tsx
export const Route = createFileRoute("/courses/$id")({
  loader: ({ params }) => fetchCourse(params.id),
  pendingComponent: () => <Spinner />,  // Suspense fallback
  errorComponent: ({ error }) => (
    <div>
      <p>Error: {error.message}</p>
      <Link to="/courses">Back to courses</Link>
    </div>
  ),
  notFoundComponent: () => <p>Course not found</p>,
  component: CourseDetailPage,
});
```

---

## Pathless Layout Routes

Group routes with a shared layout that doesn't add a URL segment.

```
routes/
├── _authenticated/                     ← _ = pathless layout
│   ├── route.tsx               → Layout (auth check)
│   ├── students.tsx            → /students (not /_authenticated/students)
│   └── courses.tsx             → /courses
├── login.tsx                   → /login (no layout wrapper)
```

The `_` prefix means "no URL segment, just a layout wrapper".

---

## Architecture Best Practices

```
src/
├── routes/
│   ├── __root.tsx                       ← Shell
│   ├── _authenticated/
│   │   ├── route.tsx                    ← Auth guard
│   │   ├── students/
│   │   │   ├── route.tsx                ← Students layout
│   │   │   ├── index.tsx                ← /students
│   │   │   ├── $id.tsx                  ← /students/$id
│   │   │   └── -components/             ← student-specific UI (not a route)
│   │   └── courses/
│   │       ├── route.tsx                ← Courses layout
│   │       ├── index.tsx                ← /courses
│   │       ├── $id.tsx                  ← /courses/$id
│   │       └── -components/
│   └── login.tsx                        ← /login
├── components/                          ← Shared UI
├── generated/                           ← API hooks (Kubb)
└── lib/                                 ← Utilities
```

**Key patterns:**
- `-` prefix = not a route, co-located with the route
- `_` prefix = pathless layout
- `route.tsx` in folder = layout for children
- Shared components in top-level `components/`

---

## Devtools

```tsx
// src/routes/__root.tsx
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

function RootLayout() {
  return (
    <>
      <nav>...</nav>
      <main><Outlet /></main>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
```

Shows route tree, current match, params, search state — invaluable for debugging.

---

## Related Pages

- [REACT.md](REACT.md) — Building components with hooks
- [KUBB.md](KUBB.md) — Generating typed API hooks for loaders
- [AI_DEV.md](AI_DEV.md) — Developing routed apps with AI assistance
