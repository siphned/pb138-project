# Seminar 09 Assignment: Auth & Observability

This assignment walks you through adding **authentication**, **authorization**, and **observability** to a working university management app. Work through the three phases in order — each phase builds on the previous one.

## Prerequisites

1. Run the existing app first — make sure everything works before you change anything:

   ```bash
   bun i
   docker compose up -d
   cp apps/server/.env.example apps/server/.env
   cp apps/web/.env.example apps/web/.env
   bun run db:push
   bun run db:seed
   bun run dev
   ```

   Verify: http://localhost:5173 shows courses and students. http://localhost:3000/api-docs shows the API.

2. **ClickStack** (for Phase 3) is running at http://localhost:8080. You'll use it to visualize traces. Open it now and leave it open in a tab.

3. Create a **Clerk account** at https://clerk.com (free). Create a new application — pick "Email" as the sign-in method. You'll need two values from the **API Keys** tab:
   - `CLERK_SECRET_KEY` → add to `apps/server/.env`
   - `VITE_CLERK_PUBLISHABLE_KEY` → add to `apps/web/.env`

4. Create a **Sentry account** at https://sentry.io (free). Create two projects — one **Node.js** (for the server) and one **React** (for the frontend). Copy each DSN:
   - Server DSN → `SENTRY_DSN` in `apps/server/.env`
   - Frontend DSN → `VITE_SENTRY_DSN` in `apps/web/.env`

---

## Phase 1: Authentication — "Who are you?"

**Goal:** Only signed-in users can access the Courses and Students sections.

### Step 1.1 — Set up ClerkProvider (frontend)

Find `// TODO [AUTH-1]` in `apps/web/src/routes/__root.tsx`.

Add the import and wrap the return value in `<ClerkProvider>`:

```tsx
import { ClerkProvider } from "@clerk/react";

// Inside RootLayout, wrap the return:
return (
  <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
    <QueryClientProvider client={queryClient}>
      {/* ... existing content ... */}
    </QueryClientProvider>
  </ClerkProvider>
);
```

### Step 1.2 — Add sign-in button to nav (frontend)

Find `// TODO [AUTH-2]` in `apps/web/src/routes/__root.tsx`.

Add the sign-in/user button to the nav (`<Show>` is the v6 replacement for the removed `<SignedIn>`/`<SignedOut>` components):

```tsx
import { Show, SignInButton, UserButton } from "@clerk/react";

// Replace the TODO comment block with:
<div className="ml-auto flex items-center gap-3">
  <Show when="signed-out">
    <SignInButton mode="modal">
      <button className="text-sm text-muted-foreground hover:text-foreground">
        Sign in
      </button>
    </SignInButton>
  </Show>
  <Show when="signed-in">
    <UserButton />
  </Show>
</div>;
```

**Test:** Reload http://localhost:5173 — you should see a "Sign in" link in the top-right. Click it and sign in with your Clerk test account. A user avatar should appear.

### Step 1.2b — Forward the Clerk token to the API (frontend)

Find `// TODO [AUTH-2b]` in `apps/web/src/lib/axios.ts`.

Every API call goes through the shared `axiosInstance`. Register a request interceptor so the signed-in user's JWT is attached to each request automatically:

```ts
axiosInstance.interceptors.request.use(async (config) => {
  const token = await window.Clerk?.session?.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

Add these lines directly after the `axiosInstance` definition. No React hook or `useEffect` is needed — the interceptor callback runs lazily at request time, so `window.Clerk` is already initialised by then.

**Test:** Sign in, navigate to /courses, open DevTools → Network tab. Every request to `localhost:3000` should now include an `Authorization: Bearer <token>` header. This is what the server's Clerk middleware reads in Steps 1.4 and 2.x.

### Step 1.3 — Protect the frontend routes (frontend)

Find `// TODO [AUTH-3]` in `apps/web/src/routes/courses/route.tsx` and `// TODO [AUTH-4]` in `students/route.tsx`.

Add `<Show>` guards inside each layout component (`<Show>` is Clerk v6's replacement for the old `<SignedIn>`/`<SignedOut>`):

```tsx
import { Show, SignInButton } from "@clerk/react";

function CoursesLayout() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Courses</h1>
      <Show when="signed-in">
        <Outlet />
      </Show>
      <Show when="signed-out">
        <p className="text-muted-foreground">
          <SignInButton mode="modal">
            <button className="underline">Sign in</button>
          </SignInButton>{" "}
          to view courses.
        </p>
      </Show>
    </div>
  );
}
```

Apply the same pattern to `StudentsLayout`.

**Test:** Sign out (click avatar → Sign out). Navigate to /courses — you should see the sign-in prompt instead of courses.

> **Note:** If API calls start returning errors (500) after signing in, that is expected at this point — the server middleware isn't wired up yet. Proceed to Step 1.4 to fix it. Keep the browser Network tab open to see the responses.

### Step 1.4 — Verify JWT on the server

Find `// TODO [AUTH-5]` in `apps/server/src/middleware/clerk.ts`.

Wrap in a try/catch — `verifyToken` throws on invalid/expired tokens and we want those to return `{ clerk: null }` rather than a 500:

```typescript
try {
  const payload = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY!,
  });
  const role = payload.role as Role | undefined;
  const permissions = ROLE_PERMISSIONS[role as Role] ?? [];
  return { clerk: { sub: payload.sub, role: role ?? '', permissions } };
} catch {
  return { clerk: null };
}
```

Then find `// TODO [AUTH-6]` in `apps/server/src/app.ts`.

Add the import and registration:

```typescript
import { clerkMiddleware } from './middleware/clerk'

// Inside createApp(), add after the openapi() plugin:
.use(clerkMiddleware)
```

**Test:** Restart the server. Open the Network tab in DevTools, sign in, and copy the `Authorization: Bearer <token>` header from any API request. Use it with curl:

```bash
curl -H "Authorization: Bearer <your_token>" http://localhost:3000/students
```

---

## Phase 2: Authorization — "What are you allowed to do?"

**Goal:** Only users with the right permission may create courses or enroll students.

### Step 2.1 — Configure roles in Clerk dashboard

1. Go to your Clerk dashboard → **Users** → click your test user → **Metadata** (public). Set:
   ```json
   {
     "role": "instructor"
   }
   ```
   For a student account:
   ```json
   {
     "role": "student"
   }
   ```

2. Go to **Configure** → **Sessions** → **Customize session token**. Set the JWT template to:
   ```json
   {
     "role": "{{user.public_metadata.role}}"
   }
   ```

> **How this works:** The JWT carries only a single `role` string. The server expands it to a permissions array via `ROLE_PERMISSIONS` — permissions never touch the wire. The frontend reads `sessionClaims.role` directly. Sign out and back in after changing the template or metadata for the new claims to appear in the token.

### Step 2.2 — Implement requirePermission (server)

Find `// TODO [AUTH-7]` in `apps/server/src/middleware/requirePermission.ts`.

```typescript
if (!clerk) {
  set.status = 401;
  return {
    status: 401,
    title: "Unauthorized",
    detail: "No credentials provided",
  } satisfies ProblemDetail;
}

if (!clerk.permissions.includes(permission)) {
  set.status = 403;
  return {
    status: 403,
    title: "Forbidden",
    detail: `Missing permission: ${permission}`,
  } satisfies ProblemDetail;
}
```

### Step 2.3 — Apply permission guards to routes (server)

Find `// TODO [AUTH-8]` in `courses.routes.ts`, `// TODO [AUTH-9]` in `instructors.routes.ts`, and `// TODO [AUTH-10]` in `enrollments.routes.ts`.

For each, add the import and chain the guard:

```typescript
import { requirePermission } from '../../middleware/requirePermission'

// For courses.routes.ts — add before .post('/'):
.use(requirePermission('org:courses:create'))

// For instructors.routes.ts — add before .post('/'):
.use(requirePermission('org:instructors:create'))

// For enrollments.routes.ts — add before .post('/:id/enroll'):
.use(requirePermission('org:students:enroll'))
```

### Step 2.4 — Hide the create-course form for non-instructors (frontend)

Find `// TODO [AUTH-11]` in `apps/web/src/routes/courses/index.tsx`.

```tsx
import { useAuth } from "@clerk/react";

// Inside CoursesPage():
const { sessionClaims } = useAuth();
const role = sessionClaims?.role as string | undefined;
const canCreateCourse = role === "admin" || role === "instructor";

// Replace <CreateCourseForm /> with:
{
  canCreateCourse && <CreateCourseForm />;
}
```

> **Why `sessionClaims` instead of `has()`?** `has()` reads org-level permissions from an active org session. `sessionClaims` gives you the raw decoded JWT — which contains the `role` string injected by the JWT template in Step 2.1.

**Test:** Sign in as an instructor → "Create course" form is visible, creating a course works. Sign in as a student → form is hidden, trying to POST /courses returns 403.

---

## Phase 3: Observability — "What is the system doing?"

**Goal:** Know when things break (Sentry — required) and understand what the system does (OpenTelemetry — bonus).

### Step 3.1 — Import instrumentation on server startup

Find `// TODO [SENTRY-0]` in `apps/server/src/server.ts`. Add as the **first line**:

```typescript
import "./instrumentation";
```

### Step 3.2 — Initialize Sentry on the server

Find `// TODO [SENTRY-1]` in `apps/server/src/instrumentation.ts`. Replace it with:

```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? "development",
});
```

Also remove the `void Sentry` line at the bottom.

### Step 3.3 — Capture unhandled errors in Sentry

Find `// TODO [SENTRY-2]` in `apps/server/src/app.ts`.

In the final `else` branch of `onError`, before the `console.error` line:

```typescript
import * as Sentry from "@sentry/node";

Sentry.captureException(error);
console.error("Unhandled error:", error);
```

**Test:** Temporarily add `throw new Error('test sentry')` to any route handler. Make a request. The error should appear in Sentry Issues within 30 seconds. Remove the throw.

### Step 3.4 — Initialize Sentry in the frontend

Find `// TODO [SENTRY-3]` in `apps/web/src/router.tsx`.

Add to imports at the **top of the file**:

```typescript
import * as Sentry from "@sentry/react";
```

Add inside `getRouter()`, after `createTanStackRouter({ ... })` and before the `return`:

```typescript
// Inside getRouter(), after const router = createTanStackRouter({ ... }):
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [Sentry.tanstackRouterBrowserTracingIntegration(router)],
});
```

**Test:** Open the browser DevTools → Network tab. Reload http://localhost:5173 and look for a request to `ingest.sentry.io` — that confirms the frontend is connected.

---

## Bonus: OpenTelemetry traces + logs

> Skip this if you're short on time — Sentry is the core of this phase. Come back here once Phases 1–3 are done.

First, get your **ClickStack API key**: open http://localhost:8080, sign up (or sign in), go to **Team Settings → API Keys** and copy the key. Add it to `apps/server/.env`:

```
CLICKSTACK_API_KEY=your_key_here
```

### Bonus 3.1 — Create the OTEL plugin

Find `// TODO [OTEL-1]` in `apps/server/src/middleware/otelPlugin.ts`. Replace the placeholder export with:

```typescript
const otlpHeaders: Record<string, string> = process.env.CLICKSTACK_API_KEY
  ? { Authorization: process.env.CLICKSTACK_API_KEY }
  : {};
const otlpBase =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318";

export const otelPlugin = opentelemetry({
  serviceName: process.env.OTEL_SERVICE_NAME ?? "pb138-server",
  spanProcessors: [
    new SimpleSpanProcessor(
      new OTLPTraceExporter({
        url: `${otlpBase}/v1/traces`,
        headers: otlpHeaders,
      }) as AnyProcessor,
    ) as AnyProcessor,
  ],
  logRecordProcessors: [
    new SimpleLogRecordProcessor(
      new OTLPLogExporter({
        url: `${otlpBase}/v1/logs`,
        headers: otlpHeaders,
      }) as AnyProcessor,
    ) as AnyProcessor,
  ],
});
```

Remove the `void` lines and the placeholder `new Elysia()` export.

Also update `Sentry.init()` in `instrumentation.ts` to add `skipOpenTelemetrySetup: true` — without it Sentry registers its own TracerProvider first and this plugin silently becomes a no-op.

### Bonus 3.2 — Register the plugin

Find `// BONUS [OTEL-3]` in `apps/server/src/app.ts` and implement it.

### Bonus 3.3 — Add a custom span (Wide Event)

Find `// TODO [OTEL-4]` in `apps/server/src/modules/enrollments/enrollments.service.ts` and implement it.

**Test:** Enroll a student via the UI. Open http://localhost:8080 → **Traces** → search for `enrollment.bulkEnroll`. Click the span to see `app.student_id`, `app.course_ids`, and `app.enrolled_count` attributes.

### Bonus 3.4 — Ship console output as logs

Find `// BONUS [OTEL-5]` in `otelPlugin.ts` and add the console bridge after the `export const otelPlugin` line.

**Test:** Open http://localhost:8080 → **Search** and filter by service `pb138-server` → switch to Logs. The startup messages "Server running on…" and "API docs:…" should appear.

---

## Done? Fill in SOLUTION.md

Open `SOLUTION.md` and answer the five reflection questions before submitting.
