import { Elysia } from "elysia";
import { authPlugin } from "../auth";
import {
  addressBody,
  addressesResponseSchema,
  addressResponseSchema,
  updateProfileBody,
  userResponseSchema,
} from "./users.schema";
import { usersService } from "./users.service";

export const usersRoutes = new Elysia({ prefix: "/users" })
  .use(authPlugin)

  .get("/me", async ({ dbUser }) => dbUser, {
    requireAuth: true,
    response: userResponseSchema,
    detail: {
      tags: ["users"],
      summary: "Get current authenticated user",
      description:
        "Returns the caller's user record. If no local row exists yet, one is lazily created from Clerk profile data on first call.",
      security: [{ bearerAuth: [] }],
    },
  })

  .put(
    "/me",
    async ({ dbUser, body }) => {
      return await usersService.updateProfileById(dbUser.id, body);
    },

    {
      requireAuth: true,
      body: updateProfileBody,
      response: userResponseSchema,
      detail: {
        tags: ["users"],
        summary: "Update current user profile",
        description: "Updates the first or last name of the authenticated user.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .get(
    "/me/addresses",
    async ({ dbUser }) => {
      return await usersService.getAddressesForUser(dbUser);
    },
    {
      requireAuth: true,
      response: addressesResponseSchema,
      detail: {
        tags: ["users"],
        summary: "Get current user addresses",
        description: "Returns the shipping and billing addresses linked to the authenticated user.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .post(
    "/me/addresses",
    async ({ dbUser, body }) => {
      const { type, ...addressData } = body;
      return await usersService.upsertAddressForUser(dbUser.id, type, addressData);
    },
    {
      requireAuth: true,
      body: addressBody,
      response: addressResponseSchema,
      detail: {
        tags: ["users"],
        summary: "Set a shipping or billing address",
        description:
          "Creates a new address and links it as the shipping or billing address for the authenticated user. Replaces any previously linked address of the same type.",
        security: [{ bearerAuth: [] }],
      },
    }
  );
