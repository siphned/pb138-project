# Conductor Tracks Registry

This file serves as the registry for all active Conductor tracks. Each entry below represents a track and provides a brief description and its associated Jira ticket.

## Tracks

### WINE-175: Component Library Consistency
- **Description:** Replace raw `<button>` elements with `@/components/ui/button` and address unused `packages/ui`.
- **Jira Ticket:** WINE-175
- **Track Path:** conductor/tracks/WINE-175_Component_Library_Consistency/

### WINE-176: Styling Refinements
- **Description:** Promote status colors and font sizes in `MyWines.tsx`, split large component.
- **Jira Ticket:** WINE-176
- **Track Path:** conductor/tracks/WINE-176_Styling_Refinements/

### WINE-177: Data Loading Optimization
- **Description:** Optionally migrate Nominatim call in `ShopMapEmbed.tsx` to `useQuery`.
- **Jira Ticket:** WINE-177
- **Track Path:** conductor/tracks/WINE-177_Data_Loading_Optimization/

### WINE-178: Environment Variable Management
- **Description:** Use env vars for CORS, OpenAPI URL, tighten gitignore, refine DB URL handling.
- **Jira Ticket:** WINE-178
- **Track Path:** conductor/tracks/WINE-178_Environment_Variable_Management/

### WINE-179: API Documentation
- **Description:** Document endpoint mappings in `docs/API/`.
- **Jira Ticket:** WINE-179
- **Track Path:** conductor/tracks/WINE-179_API_Documentation/

### WINE-180: Database Code Extraction
- **Description:** Extract stock allocation logic from `products.repository.ts`.
- **Jira Ticket:** WINE-180
- **Track Path:** conductor/tracks/WINE-180_Database_Code_Extraction/

### WINE-181: Backend Error Handling Consolidation
- **Description:** Use `handleError` helper in `wines.routes.ts` and `role-requests.routes.ts`.
- **Jira Ticket:** WINE-181
- **Track Path:** conductor/tracks/WINE-181_Backend_Error_Handling_Consolidation/

### WINE-182: Auth Testing
- **Description:** (Future) Add dedicated tests for auth macros in `apps/server/src/modules/auth/auth.plugin.test.ts`.
- **Jira Ticket:** WINE-182
- **Track Path:** conductor/tracks/WINE-182_Auth_Testing/

### WINE-183: Testing Improvements
- **Description:** Delete placeholder tests and improve frontend coverage.
- **Jira Ticket:** WINE-183
- **Track Path:** conductor/tracks/WINE-183_Testing_Improvements/

### WINE-184: Logging Implementation
- **Description:** Add `pino`, remove unused log, update startup banners.
- **Jira Ticket:** WINE-184
- **Track Path:** conductor/tracks/WINE-184_Logging_Implementation/

### WINE-185: Error Handling Refinement
- **Description:** Add top-level React `ErrorBoundary` in `apps/web/src/main.tsx`.
- **Jira Ticket:** WINE-185
- **Track Path:** conductor/tracks/WINE-185_Error_Handling_Refinement/

### WINE-186: Security Verification
- **Description:** Verify Clerk secret handling in production environments.
- **Jira Ticket:** WINE-186
- **Track Path:** conductor/tracks/WINE-186_Security_Verification/
