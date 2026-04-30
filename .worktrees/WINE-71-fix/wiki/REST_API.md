# REST APIs & HTTP

## HTTP Fundamentals

**H**yper**T**ext **T**ransfer **P**rotocol — a **request-response** protocol.

- **Stateless** — server remembers nothing, every request is independent
- **Text-based** (HTTP/1.1) or binary (HTTP/2, HTTP/3)
- HTTP/1.1 and HTTP/2 run over TCP (port `80` for HTTP, `443` for HTTPS); HTTP/3 runs over UDP

```
Client                          Server
│                                    │
│   GET /api/users HTTP/1.1          │
│ ──────────────────────────────────>│
│                                    │
│   HTTP/1.1 200 OK                  │
│   [{"id":1,"name":"Alice"}]        │
│ <──────────────────────────────────│
```

---

## HTTP Message Anatomy

### Request
```
GET /api/users?role=admin HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{"name": "Alice", "email": "a@b.com"}
```

### Response
```
HTTP/1.1 200 OK
Content-Type: application/json
Location: /api/users/42
Content-Length: 42

{"id": 42, "name": "Alice"}
```

**Parts:**
- **Method + Path** — what to do and where
- **Headers** — metadata (auth, content type, caching, CORS...)
- **Body** — data payload (JSON, form data, etc.)
- **Status code** — how it went (2xx, 4xx, 5xx...)

---

## HTTP Methods

| Method | Purpose | Has Body? | Idempotent? | Safe? |
|---|---|---|---|---|
| **GET** | Read a resource | No | Yes | Yes |
| **POST** | Create a resource | Yes | No | No |
| **PUT** | Replace fully | Yes | Yes | No |
| **PATCH** | Partial update | Yes | Usually | No |
| **DELETE** | Remove a resource | No | Yes | No |

**Idempotent** = calling N times gives the same result as calling once.
- `DELETE /users/1` twice → same state ✓
- `POST /users` twice → two users created ✗

**Safe** = doesn't modify server state.
- `GET` is safe (read-only)
- `POST`, `PUT`, `PATCH`, `DELETE` are not safe

---

## HTTP Status Codes

| Range | Category | Examples |
|---|---|---|
| **2xx** | Success | 200 OK, 201 Created, 204 No Content |
| **3xx** | Redirect | 301 Moved, 304 Not Modified |
| **4xx** | Client error | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity |
| **5xx** | Server error | 500 Internal Server Error, 503 Service Unavailable |

### Common Codes Explained

| Code | When to use | Example |
|---|---|---|
| **200 OK** | Request succeeded, response has body | GET /users → list of users |
| **201 Created** | Resource created successfully | POST /users → new user |
| **204 No Content** | Success, no response body | DELETE /users/1 → done |
| **400 Bad Request** | Client sent invalid data | POST /users with missing fields |
| **401 Unauthorized** | User not authenticated | Missing login/token |
| **403 Forbidden** | User authenticated but not authorized | Non-admin accessing /admin |
| **404 Not Found** | Resource doesn't exist | GET /users/999 |
| **409 Conflict** | Request conflicts with current state | POST /users with duplicate email |
| **422 Unprocessable Entity** | Request is well-formed but semantically invalid | POST /users with invalid email format |
| **500 Internal Server Error** | Server error | Database connection failed |

### Anti-Patterns

```js
// ❌ WRONG — returning 200 with error data
res.status(200).json({ error: "User not found" })

// ✅ CORRECT — use the right status code
res.status(404).json({ error: "User not found" })

// ❌ WRONG — 200 for all responses
res.status(200).json({ success: false, message: "..." })

// ✅ CORRECT — status codes ARE part of your API contract
res.status(400).json({ error: "Invalid input" })
res.status(401).json({ error: "Login required" })
res.status(201).json(newUser)
```

---

## REST — Architectural Style

**RE**presentational **S**tate **T**ransfer — design principles, not a strict standard.

**Core constraints:**
- **Stateless** — server stores no session
- **Uniform interface** — resources identified by URLs, standard HTTP methods
- **Client-server** — clear separation
- **Cacheable** — responses indicate cacheability
- **Layered** — client doesn't care if it talks to a proxy or the real server

---

## Resource-Oriented URLs

Think in **nouns**, not verbs.

### ❌ Verb-based (not REST)
```
/getUsers
/createUser
/updateUser?id=1
/deleteUser?id=1
/getUserPosts?userId=1
```

### ✅ Resource-based (REST)
```
GET    /api/users                    ← get all users
POST   /api/users                    ← create user
GET    /api/users/1                  ← get user #1
PUT    /api/users/1                  ← replace user #1
PATCH  /api/users/1                  ← update user #1
DELETE /api/users/1                  ← delete user #1

GET    /api/users/1/posts            ← get user #1's posts
POST   /api/users/1/posts            ← create post for user #1
```

**The URL identifies WHAT. The method identifies WHAT TO DO.**

---

## Richardson Maturity Model

A scale for how "RESTful" an API is:

```
Level 3 │  HATEOAS ────── responses include links to next actions
        │
Level 2 │  HTTP Verbs + Status Codes ────── use methods + codes correctly
        │                              ↑ most real-world APIs live here
Level 1 │  Resources ────── separate URL per resource
        │
Level 0 │  Single Endpoint ────── one URL for everything (POST /query)
```

**Target Level 2:**
- Correct HTTP methods (GET, POST, PUT, DELETE)
- Correct status codes (200, 201, 404, 400, etc.)
- Resource URLs (/users, /users/1)

Why Level 2 matters:
- Browsers and CDNs cache GET automatically
- DELETE is idempotent (clients can retry safely)
- Status codes are part of the contract (clients branch on them)
- Standard tools work (curl, Postman, OpenAPI generators)

---

## Client-Server Lifecycle

What happens when you call `fetch()`:

```
React App                     Server
│                                      │
│ 1. fetch('/api/products')             │
│    DNS: resolve hostname → IP         │
│    TCP: 3-way handshake               │
│    TLS: negotiate if HTTPS            │
│                                       │
│ 2. HTTP Request ───────────────────> │
│    GET /api/products                  │  3. Router matches path
│    Authorization: Bearer xyz          │  4. Middlewares run
│                                       │  5. Route handler executes
│                                       │  6. Data fetched (DB, cache)
│ 7. HTTP Response <──────────────────  │
│    200 OK                             │
│    [{"id":1,"name":"Widget"}]         │
│                                       │
│ 8. React updates state → re-render    │
```

---

## Query Parameters vs Path Parameters

**Path parameters** — identity, which specific resource

```
GET /api/users/123
          ^^^ user ID — part of the path
```

**Query parameters** — filtering, sorting, pagination

```
GET /api/users?role=admin&sort=name&page=2
                ^^^^^^^^^^^^^^^^^^^^^^^ filtering/sorting/pagination
```

```tsx
// React example
const { userId } = Route.useParams();  // path params
const { sort, page } = Route.useSearch();  // query params

fetch(`/api/users/${userId}?sort=${sort}&page=${page}`)
```

---

## Related Pages

- [ELYSIA.md](ELYSIA.md) — Building REST APIs in Elysia
- [KUBB.md](KUBB.md) — Generating typed clients from API specs
- [ROUTING.md](ROUTING.md) — Using params and search params in frontend routes
