# React Components & State Management

## Core Concept

A component is a **function that returns JSX**. UI = `f(props, state)`

```tsx
function Greeting() {
  return <h1>Hello, world!</h1>;
}
```

Rules:
- Component names start with **uppercase** letter
- Returns one root element or a fragment `<>...</>`
- Must be pure functions (same input → same output)

---

## Props — Passing Data to Components

Props are **read-only inputs** that configure a component.

```tsx
type GreetingProps = {
  name: string;
  subtitle?: string;  // optional
};

function Greeting({ name, subtitle }: GreetingProps) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
```

**Usage:**
```tsx
<Greeting name="Alice" subtitle="Welcome back" />
<Greeting name="Bob" />
```

---

## Children — Component Composition

The `children` prop allows nesting content inside a component.

```tsx
type CardProps = {
  children: React.ReactNode;
};

function Card({ children }: CardProps) {
  return <div className="border rounded p-4">{children}</div>;
}
```

**Usage:**
```tsx
<Card>
  <h2>Title</h2>
  <p>Any content goes here.</p>
</Card>
```

This is the foundation of **composable UIs** — build small, reusable components and combine them.

---

## Conditional Rendering

### Short-Circuit with `&&`
```tsx
function Alert({ message, visible }: { message: string; visible: boolean }) {
  return <div>{visible && <p>⚠️ {message}</p>}</div>;
}
```

### Ternary for if/else
```tsx
function Status({ isOnline }: { isOnline: boolean }) {
  return <span>{isOnline ? "🟢 Online" : "🔴 Offline"}</span>;
}
```

### Multiple conditions
```tsx
function UserBadge({ role }: { role: "admin" | "user" | "guest" }) {
  if (role === "admin") return <span className="bg-red-100">Admin</span>;
  if (role === "user") return <span className="bg-blue-100">User</span>;
  return <span>Guest</span>;
}
```

---

## Lists & Keys

Always provide a unique `key` prop when rendering lists with `.map()`.

```tsx
type User = { id: number; name: string; role: string };

const users: User[] = [
  { id: 1, name: "Alice", role: "Admin" },
  { id: 2, name: "Bob", role: "Editor" },
];

function UserList() {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          {user.name} — {user.role}
        </li>
      ))}
    </ul>
  );
}
```

**Why keys matter:** They help React identify which items have changed, been added, or been removed. Avoid using array indices as keys (breaks if list is reordered).

---

## Hooks — State & Side Effects

### useState — Reactive State

```tsx
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);

// Update state
setCount(count + 1);
setUser({ id: 1, name: "Alice" });
```

State updates trigger re-renders. **Rules:**
- Only call hooks at the **top level** — never inside `if`, loops, or callbacks
- Call hooks unconditionally
- Custom hooks must start with `use`

### useEffect — Side Effects

```tsx
// Run once on mount
useEffect(() => {
  console.log("Component mounted");
  return () => console.log("Cleanup"); // cleanup function
}, []);

// Run when count changes
useEffect(() => {
  console.log("Count changed to", count);
}, [count]); // dependency array

// Run on every render (avoid if possible)
useEffect(() => {
  console.log("This runs on EVERY render");
});
```

Use `useEffect` for:
- API calls
- Event listeners
- Timers
- Subscriptions

Return a cleanup function to unsubscribe/cancel requests.

### useMemo — Caching Computations

```tsx
const sorted = useMemo(() => {
  console.log("Sorting...");
  return users.sort((a, b) => a.name.localeCompare(b.name));
}, [users]); // only re-run if users changes
```

Prevents expensive recalculations. Skip if the computation is fast.

### useRef — Mutable Values (No Re-render)

```tsx
const inputRef = useRef<HTMLInputElement>(null);

const focus = () => {
  inputRef.current?.focus();
};

return <input ref={inputRef} />;
```

`useRef` is for:
- Direct DOM access
- Storing mutable values that don't trigger re-renders
- Timers/intervals that shouldn't re-run

---

## Custom Hooks

Extract reusable logic into functions starting with `use`.

```tsx
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Usage — same API as useState, but persists across refreshes
const [theme, setTheme] = useLocalStorage("theme", "light");
const [cart, setCart] = useLocalStorage<CartItem[]>("cart", []);
```

Custom hooks are composable, testable, and reusable pieces of stateful logic.

---

## File Organization

One component per file. Use named exports.

```
src/components/
├── UserList.tsx
├── StatusBadge.tsx
├── TeamMemberCard.tsx
├── ui/                    ← shadcn components
│   ├── button.tsx
│   ├── card.tsx
│   └── input.tsx
└── App.tsx
```

**Why separate files?**
- Easier to find and edit
- Better code reuse
- Cleaner imports in parent components

---

## Anti-Patterns

### ❌ Creating objects/arrays in props
```tsx
// Bad — creates new object on every render
<User user={{ name: "Alice", age: 30 }} />

// Good — define outside
const user = { name: "Alice", age: 30 };
<User user={user} />
```

### ❌ Calling functions in render
```tsx
// Bad — creates new function on every render
<button onClick={handleClick()}>Click</button>

// Good — pass function reference
<button onClick={handleClick}>Click</button>
```

### ❌ setState in render
```tsx
// Bad — infinite loop
function Component() {
  const [count, setCount] = useState(0);
  setCount(count + 1);  // ❌ runs on every render!
  return <div>{count}</div>;
}

// Good — use useEffect
function Component() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(count + 1);
  }, []); // runs once
  return <div>{count}</div>;
}
```

---

## Related Pages

- [STYLING.md](STYLING.md) — Styling React components with Tailwind
- [ROUTING.md](ROUTING.md) — Organizing components into routes
- [AI_DEV.md](AI_DEV.md) — Patterns for AI-assisted React development
