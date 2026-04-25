import Elysia from 'elysia'
import type { ClerkClaims } from './clerk'
import type { ProblemDetail } from '../types'

/**
 * Elysia plugin factory that enforces a required Clerk permission.
 * Must be used AFTER clerkMiddleware is registered on the app.
 *
 * Usage: router.use(requirePermission('org:courses:create'))
 *
 * @param permission - The permission string to enforce, e.g. 'org:courses:create'
 */
export function requirePermission(permission: string) {
  return new Elysia({ name: `require-permission:${permission}` })
    .onBeforeHandle({ as: 'scoped' }, ({ set, ...ctx }) => {
      // Access clerk from context — runtime expectation, not TypeScript-verified.
      // This only works if clerkMiddleware is registered on the app BEFORE this plugin.
      const clerk = (ctx as unknown as { clerk: ClerkClaims | null }).clerk

      if (!clerk) {
        set.status = 401
        return { status: 401, title: 'Unauthorized', detail: 'No credentials provided' } satisfies ProblemDetail
      }

      if (!clerk.permissions.includes(permission)) {
        set.status = 403
        return { status: 403, title: 'Forbidden', detail: `Missing permission: ${permission}` } satisfies ProblemDetail
      }
    })
}
