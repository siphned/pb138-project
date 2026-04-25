import { Elysia } from "elysia";
import { cartsService } from "../carts/carts.service";
import { usersService } from "../users/users.service";
import type { AppRole, ClerkPayload } from "./auth.utils";
import { verifyClerkToken } from "./auth.utils";

export type { AppRole, ClerkPayload };

export const authPlugin = new Elysia({ name: "auth" }).macro({
  requireAuth: {
    async resolve({ headers, status, cookie: { guest_session_id: guestSessionId } }) {
      const payload = await verifyClerkToken(headers.authorization);
      if (!payload) return status(401);

      const dbUser = await usersService.lazyGetOrCreate(payload.sub, payload);

      const sessionId = guestSessionId?.value;
      if (typeof sessionId === "string") {
        await cartsService.mergeOnLogin(dbUser.id, sessionId);
        guestSessionId?.remove();
      }

      return {
        clerkId: payload.sub,
        clerkPayload: payload,
        dbUser,
      };
    },
  },

  requireRoles: (roles: AppRole[]) => ({
    async resolve({ headers, status, cookie: { guest_session_id: guestSessionId } }) {
      const payload = await verifyClerkToken(headers.authorization);
      if (!payload) return status(401);

      const hasRole = roles.some((role) => payload.roles?.includes(role));
      if (!hasRole) return status(403);

      const dbUser = await usersService.lazyGetOrCreate(payload.sub, payload);

      const sessionId = guestSessionId?.value;
      if (typeof sessionId === "string") {
        await cartsService.mergeOnLogin(dbUser.id, sessionId);
        guestSessionId?.remove();
      }

      return {
        clerkId: payload.sub,
        clerkPayload: payload,
        dbUser,
      };
    },
  }),
});
