import { Elysia } from "elysia";
import { usersService } from "../users/users.service";
import type { ClerkPayload } from "./auth.utils";
import { verifyClerkToken } from "./auth.utils";

export type { ClerkPayload };
export type AppRole = "user" | "admin" | "winemaker" | "shop_owner";

export const authPlugin = new Elysia({ name: "auth" }).macro({
  requireAuth: {
    async resolve({ headers, status }) {
      const payload = await verifyClerkToken(headers.authorization);
      if (!payload) return status(401);

      const dbUser = await usersService.lazyGetOrCreate(payload.sub, payload);

      return {
        clerkId: payload.sub,
        clerkPayload: payload,
        dbUser,
      };
    },
  },

  requireRole: (role: "admin") => ({
    async resolve({ headers, status }) {
      const payload = await verifyClerkToken(headers.authorization);
      if (!payload) return status(401);
      if (payload.role !== role) return status(403);

      const dbUser = await usersService.lazyGetOrCreate(payload.sub, payload);

      return {
        clerkId: payload.sub,
        clerkPayload: payload,
        dbUser,
      };
    },
  }),

  requireCapability: (capability: "winemaker" | "shop_owner") => ({
    async resolve({ headers, status }) {
      const payload = await verifyClerkToken(headers.authorization);
      if (!payload) return status(401);

      const hasCapability =
        capability === "winemaker" ? payload.is_winemaker === true : payload.is_shop_owner === true;

      if (!hasCapability) return status(403);

      const dbUser = await usersService.lazyGetOrCreate(payload.sub, payload);

      return {
        clerkId: payload.sub,
        clerkPayload: payload,
        dbUser,
      };
    },
  }),
});
