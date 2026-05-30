import { Elysia } from "elysia";
import { db } from "../../db";
import { cartsService } from "../carts/carts.service";
import * as userRolesRepo from "../users/user-roles.repository";
import { usersService } from "../users/users.service";
import type { AppRole, ClerkPayload } from "./auth.utils";
import { verifyClerkToken } from "./auth.utils";

export type { AppRole, ClerkPayload };

/**
 * Roles the caller holds. We accept the union of:
 *   1) `payload.roles` from the Clerk JWT (when the JWT template includes
 *      the `roles` claim), and
 *   2) roles stored in our DB (synced from Clerk `public_metadata.roles`
 *      via `usersService.fetchExternalProfile`).
 *
 * The fallback exists because Clerk's default JWT does not include the
 * custom `roles` claim — projects that haven't configured the JWT
 * template would 403 on every capability check even for legitimate
 * winemakers / shop owners / admins.
 */
async function resolveCallerRoles(
  payloadRoles: AppRole[] | undefined,
  userId: string
): Promise<string[]> {
  const fromJwt = payloadRoles ?? [];
  if (fromJwt.length > 0) return fromJwt;
  return userRolesRepo.findByUserId(db, userId);
}

export const authPlugin = new Elysia({ name: "auth" }).macro({
  requireAuth: {
    async resolve({ headers, status, cookie: { guest_session_id: guestSessionId } }) {
      const payload = await verifyClerkToken(headers.authorization);
      if (!payload) return status(401);

      const dbUser = await usersService.lazyGetOrCreate(payload.sub);
      const callerRoles = await resolveCallerRoles(payload.roles, dbUser.id);

      const sessionId = guestSessionId?.value;
      if (typeof sessionId === "string") {
        await cartsService.mergeOnLogin(dbUser.id, sessionId);
        guestSessionId?.remove();
      }

      return {
        clerkId: payload.sub,
        clerkPayload: { ...payload, roles: callerRoles as AppRole[] },
        dbUser,
      };
    },
  },

  requireCapability: (capability: AppRole) => ({
    async resolve({ headers, status, cookie: { guest_session_id: guestSessionId } }) {
      const payload = await verifyClerkToken(headers.authorization);
      if (!payload) return status(401);

      const dbUser = await usersService.lazyGetOrCreate(payload.sub);
      const callerRoles = await resolveCallerRoles(payload.roles, dbUser.id);
      if (!callerRoles.includes(capability)) return status(403);

      const sessionId = guestSessionId?.value;
      if (typeof sessionId === "string") {
        await cartsService.mergeOnLogin(dbUser.id, sessionId);
        guestSessionId?.remove();
      }

      return {
        clerkId: payload.sub,
        clerkPayload: { ...payload, roles: callerRoles as AppRole[] },
        dbUser,
      };
    },
  }),

  requireRoles: (roles: AppRole[]) => ({
    async resolve({ headers, status, cookie: { guest_session_id: guestSessionId } }) {
      const payload = await verifyClerkToken(headers.authorization);
      if (!payload) return status(401);

      const dbUser = await usersService.lazyGetOrCreate(payload.sub);
      const callerRoles = await resolveCallerRoles(payload.roles, dbUser.id);
      const hasRole = roles.some((role) => callerRoles.includes(role));
      if (!hasRole) return status(403);

      const sessionId = guestSessionId?.value;
      if (typeof sessionId === "string") {
        await cartsService.mergeOnLogin(dbUser.id, sessionId);
        guestSessionId?.remove();
      }

      return {
        clerkId: payload.sub,
        clerkPayload: { ...payload, roles: callerRoles as AppRole[] },
        dbUser,
      };
    },
  }),
});
