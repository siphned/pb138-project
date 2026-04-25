import { verifyToken } from '@clerk/backend'
import Elysia from 'elysia'

export type Role = 'admin' | 'instructor' | 'student'

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin:      ['org:courses:create', 'org:instructors:create', 'org:students:enroll'],
  instructor: ['org:courses:create', 'org:students:enroll'],
  student:    ['org:students:enroll'],
}

/**
 * The shape of the decoded Clerk session claims.
 *
 * Clerk embeds `role` via a custom JWT template.
 * Dashboard path: Configure → Sessions → Customize session token
 * Add: { "role": "{{user.public_metadata.role}}" }
 *
 * Permissions are derived server-side from ROLE_PERMISSIONS — they are NOT in the JWT.
 */
export type ClerkClaims = {
  sub: string
  role: Role | ''
  permissions: string[]
}

/**
 * Elysia plugin that verifies the Clerk JWT on every request and
 * attaches decoded claims to the request context as `clerk`.
 *
 * Usage: app.use(clerkMiddleware)
 */
export const clerkMiddleware = new Elysia({ name: 'clerk' })
  .derive({ as: 'global' }, async ({ headers }): Promise<{ clerk: ClerkClaims | null }> => {
    const authHeader = headers['authorization']
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return { clerk: null }
    }

    try {
      const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! })
      const role = payload.role as Role | undefined
      const permissions = ROLE_PERMISSIONS[role as Role] ?? []
      return { clerk: { sub: payload.sub, role: role ?? '', permissions } }
    } catch {
      return { clerk: null }
    }
  })
