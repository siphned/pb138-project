# Frontend Project Structure

## Folder Organization

```
src/
├── components/          # Reusable UI components
├── generated/          # Auto-generated code (clients, hooks, types) from API specs
│   ├── clients/       # Generated API clients
│   ├── hooks/         # Generated React hooks
│   └── types/         # Generated types from API
├── lib/                # Utilities, helpers, and library functions
├── pages/              # Page-level components (full screens)
├── routes/             # Route definitions and routing logic
├── types/              # Shared TypeScript type definitions
│   ├── index.ts       # Main types export
│   └── api.ts         # API-related types
├── assets/             # Images, fonts, icons
├── App.tsx             # Root component
├── main.tsx            # Entry point
├── index.css           # Global styles
└── App.css             # App-level styles
```

## Path Aliases

Use `@/` prefix for imports instead of relative paths:

```typescript
// ❌ Avoid
import { Button } from '../../../components/Button';

// ✅ Use
import { Button } from '@/components';
```

## Barrel Exports

Each folder has an `index.ts` file for cleaner imports:

```typescript
// ❌ Instead of
import { Button } from '@/components/Button';

// ✅ Use
import { Button } from '@/components';
```

## Generated Code

The `generated/` folder contains auto-generated code from:
- **clients/**: API client code (e.g., tRPC clients, REST clients)
- **hooks/**: Generated React hooks for API calls
- **types/**: TypeScript types extracted from API specifications

Do not manually edit files in the `generated/` folder - they are auto-generated.

## Type Definitions

- **types/index.ts**: Main export for shared types across the app
- **types/api.ts**: API request/response types and interfaces
