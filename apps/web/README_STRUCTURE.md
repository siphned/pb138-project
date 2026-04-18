# Frontend Project Structure

## Folder Organization

```
src/
├── components/          # Reusable UI components
├── context/             # React Context providers
├── constants/           # App-wide constants and config
├── hooks/               # Custom React hooks (useAuth, useToggle, etc.)
├── services/            # API services and utility functions
├── generated/           # Auto-generated code (clients, hooks, types) from API specs
│   ├── clients/        # Generated API clients
│   ├── hooks/          # Generated React hooks
│   └── types/          # Generated types from API
├── lib/                 # Utilities, helpers, and library functions
├── pages/               # Page-level components (full screens)
├── routes/              # Route definitions and routing logic
├── types/               # Shared TypeScript type definitions
│   ├── index.ts        # Main types export
│   └── api.ts          # API-related types
├── utils/               # Pure utility functions (formatters, validators, etc.)
├── assets/              # Images, fonts, icons
├── App.tsx              # Root component
├── main.tsx             # Entry point
├── index.css            # Global styles
└── App.css              # App-level styles
```

## Path Aliases

Use `@/` prefix for imports instead of relative paths:

```typescript
// ❌ Avoid
import { Button } from '../../../components/Button';

// ✅ Use
import { Button } from '@/components';
```

## Custom Hooks vs Generated Hooks

**hooks/** - Custom React hooks YOU write:
```typescript
// Application-specific logic
export { useAuth } from './useAuth';
export { useToggle } from './useToggle';
```

**generated/hooks/** - Auto-generated hooks (DO NOT EDIT):
```typescript
// Auto-generated from API specs
export { useGetUsersQuery } from '@/generated/hooks';
```

## Services Layer

All API calls and external service logic go in **services/**:

```typescript
// services/auth.ts
export const authService = {
  login: (email: string, password: string) => { /* ... */ },
  logout: () => { /* ... */ },
  register: (data: RegisterData) => { /* ... */ },
};

// Usage in components
import { authService } from '@/services';
const handleLogin = async () => {
  await authService.login(email, password);
};
```

## Context Layer

Share global state without prop drilling:

```typescript
// context/AuthContext.tsx
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

// Usage in components
const { user } = useContext(AuthContext);
```

## Constants

Centralize all magic strings, URLs, and configuration:

```typescript
// constants/api.ts
export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';
export const API_ENDPOINTS = {
  AUTH: { LOGIN: '/auth/login' },
  USERS: { GET_ALL: '/users' },
};

// constants/config.ts
export const APP_CONFIG = {
  APP_NAME: process.env.VITE_APP_NAME || 'My App',
  DEBUG: process.env.VITE_DEBUG === 'true',
};
```

## Utils

Pure utility functions for common tasks:

```typescript
// utils/dateFormatter.ts
export const formatDate = (date: Date): string => { /* ... */ };

// utils/validators.ts
export const validateEmail = (email: string): boolean => { /* ... */ };

// utils/stringUtils.ts
export const truncateString = (str: string, length: number): string => { /* ... */ };
```

## Barrel Exports

Each folder has an `index.ts` file for cleaner imports:

```typescript
// ❌ Instead of
import { Button } from '@/components/Button';

// ✅ Use
import { Button } from '@/components';
```

## Folder Details

### Custom Hooks (`hooks/`)
Write hooks for reusable application logic:
- `useAuth.ts` - User authentication state
- `useToggle.ts` - Boolean toggle state
- `useLocalStorage.ts` - Persist state to localStorage

### Services (`services/`)
Organize all API and business logic:
- `auth.ts` - Authentication endpoints
- `user.ts` - User data management
- `project.ts` - Project operations

Keep logic out of components!

### Context (`context/`)
React Context for global state:
- `AuthContext.tsx` - User authentication
- `ThemeContext.tsx` - Dark/light mode theme
- Wrap providers in `<App />` component

### Constants (`constants/`)
Centralize configuration and constants:
- `api.ts` - API URLs and endpoints
- `config.ts` - App configuration
- Other enums and constants

### Utils (`utils/`)
Pure utility functions:
- `dateFormatter.ts` - Format dates
- `validators.ts` - Validation helpers
- `stringUtils.ts` - String manipulation

### Generated Code

The `generated/` folder contains auto-generated code from:
- **clients/**: API client code (e.g., tRPC clients, REST clients)
- **hooks/**: Generated React hooks for API calls
- **types/**: TypeScript types extracted from API specifications

⚠️ Do not manually edit files in the `generated/` folder - they are auto-generated.

### Type Definitions

- **types/index.ts**: Main export for shared types across the app
- **types/api.ts**: API request/response types and interfaces

## Best Practices

See [README_GUIDELINES.md](./README_GUIDELINES.md) for detailed development guidelines including:
- Component structure and naming conventions
- Import organization
- TypeScript best practices
- Code quality standards

## Path Aliases

Use `@/` prefix for imports instead of relative paths:

```typescript
// ❌ Avoid
import { Button } from '../../../components/Button';

// ✅ Use
import { Button } from '@/components';
```

## Custom Hooks vs Generated Hooks

**hooks/** - Custom React hooks YOU write:
```typescript
// Application-specific logic
export { useAuth } from './useAuth';
export { useToggle } from './useToggle';
```

**generated/hooks/** - Auto-generated hooks (DO NOT EDIT):
```typescript
// Auto-generated from API specs
export { useGetUsersQuery } from '@/generated/hooks';
```

## Barrel Exports

Each folder has an `index.ts` file for cleaner imports:

```typescript
// ❌ Instead of
import { Button } from '@/components/Button';

// ✅ Use
import { Button } from '@/components';
```
