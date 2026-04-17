# Frontend Development Guidelines

## Folder Structure Rules

### files Placement

- **components/** - Reusable UI components only (Button, Card, Modal, etc.)
- **pages/** - Full page/screen components
- **hooks/** - Custom React hooks (useAuth, useToggle, etc.)
- **services/** - API calls and business logic (authService, userService, etc.)
- **context/** - React Context providers (AuthProvider, ThemeProvider, etc.)
- **utils/** - Pure utility functions (formatDate, validateEmail, etc.)
- **constants/** - App-wide constants (API URLs, config, enums, etc.)
- **types/** - TypeScript interfaces and types
- **lib/** - Helper libraries and utilities
- **generated/** - Auto-generated code (DO NOT EDIT)

### Never Put:

- API calls in components → Use services/
- Business logic in components → Use hooks/ or services/
- Magic strings/numbers → Use constants/
- Inline styles → Use CSS modules or Tailwind
- Commented code → Delete it

## Import Guidelines

### Import Order

```typescript
// 1. External libraries
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Absolute imports (@/ paths)
import { Button } from '@/components';
import { useAuth } from '@/hooks';
import { userService } from '@/services';
import { API_ENDPOINTS } from '@/constants';
import type { User } from '@/types';

// 3. Relative imports (if necessary)
import { helper } from './helper';
```

### Use Path Aliases

```typescript
// ❌ DON'T
import { Button } from '../../../components/Button';
import { formatDate } from '../../utils/formatDate';

// ✅ DO
import { Button } from '@/components';
import { formatDate } from '@/utils';
```

## Component Best Practices

### Component Naming

- Use PascalCase for component files: `UserCard.tsx`, `LoginForm.tsx`
- Use camelCase for hooks: `useAuth.ts`, `useToggle.ts`
- Use camelCase for utilities: `formatDate.ts`, `validators.ts`

### Component Structure

```typescript
// UserCard.tsx
import { FC } from 'react';
import type { User } from '@/types';

interface UserCardProps {
  user: User;
  onDelete?: (id: string) => void;
}

export const UserCard: FC<UserCardProps> = ({ user, onDelete }) => {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
};
```

### Keep Logic Out of Components

```typescript
// ❌ DON'T - Logic in component
export const UserList = () => {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => setUsers(data));
  }, []);
  
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
};

// ✅ DO - Use hooks and services
export const UserList = () => {
  const { data: users } = useGetUsers(); // Custom hook
  return <ul>{users?.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
};
```

## Hooks Best Practices

- Prefix custom hooks with `use`: `useAuth`, `useToggle`
- Keep logic focused (single responsibility)
- Return hooks in alphabetical order from index.ts

```typescript
// hooks/index.ts
export { useAuth } from './useAuth';
export { useLocalStorage } from './useLocalStorage';
export { useToggle } from './useToggle';
```

## Services Best Practices

- Group related API calls in service modules
- Return data directly (error handling in services)
- Use consistent naming conventions

```typescript
// services/user.ts
export const userService = {
  getAll: async () => { /* ... */ },
  getById: async (id: string) => { /* ... */ },
  create: async (data: CreateUserDTO) => { /* ... */ },
  update: async (id: string, data: UpdateUserDTO) => { /* ... */ },
  delete: async (id: string) => { /* ... */ },
};

// usage in components
const user = await userService.getById('123');
```

## TypeScript Best Practices

- Define interfaces for all data types
- Use `type` for unions and type aliases
- Use `interface` for object shapes

```typescript
// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export type UserRole = 'admin' | 'user' | 'guest';

// Usage
export interface UserCardProps {
  user: User;
  onSelect?: (user: User) => void;
}
```

## Code Quality

- Use **ESLint** for linting
- Use **TypeScript** strict mode
- Write meaningful variable/function names
- Add comments for complex logic only
- Keep functions small and focused

## Testing (Future)

- Write tests in `__tests__/` folders next to the code
- Use the same folder structure as `src/`
- Name test files: `Component.test.tsx`, `hook.test.ts`

## Environment Variables

- All env variables defined in `.env.example`
- Use `process.env.VITE_*` to access in code
- Never commit `.env.local`
