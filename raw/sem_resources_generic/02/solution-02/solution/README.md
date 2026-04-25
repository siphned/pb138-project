# Seminar 02 — Assignment

## Task 1: TeamMemberCard Component (~5 min)

Create a `TeamMemberCard` component in `src/components/TeamMemberCard.tsx`:

1. **Props:** `name` (string), `role` (`"designer" | "developer" | "manager"`), `email` (string), optional `available` (boolean)
2. Render the member's name, email, and role label
3. If `available` is defined, show a status indicator ("Available" / "Busy"). If undefined, show nothing.

In `App.tsx`, render a **list of team members** using `.map()` (sample data is already provided).

## Task 2: Style Team Cards with Tailwind (~10 min)

Style `TeamMemberCard` with Tailwind:

1. **Card:** `border rounded-lg p-4 shadow-sm` with `flex items-center gap-4`
2. **Role badge:** `designer` → `bg-purple-50 text-purple-700`, `developer` → `bg-blue-50 text-blue-700`, `manager` → `bg-green-50 text-green-700` (use `px-2 py-0.5 rounded-full text-xs font-medium`)
3. **Availability dot:** `w-2 h-2 rounded-full` — green `bg-green-500 animate-pulse` / red `bg-red-500`
4. **Responsive:** Wrap cards in grid — 1 col mobile, 2 on `md:`, 3 on `lg:`

## Task 3: Movie Watchlist App (~15 min)

**Setup:** shadcn components are already installed (`button`, `card`, `input`, `badge`, `separator`)

Build a Movie Watchlist in `src/components/MovieWatchlist.tsx`:

1. `Input` + `Button` to add a movie title
2. Display movies as `Card` list — title, `Badge` status ("To Watch" / "Watched"), toggle + remove buttons
3. State: `useState<{ id: number; title: string; watched: boolean }[]>([])`
4. Responsive grid: 1 col → 2 on `md:` → 3 on `lg:`
5. `Separator` between input area and movie list

## Bonus — For Fast Finishers

Extend the watchlist (pick 1-2):

- **Filter buttons:** All / To Watch / Watched
- **Empty state:** Friendly message when no movies
- **Counter badge:** Unwatched count in header
- **localStorage:** Persist with `useEffect`
