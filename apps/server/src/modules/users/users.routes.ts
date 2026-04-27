import { Elysia } from "elysia";
import { authPlugin } from "../auth";
import { userRolesRepository } from "./user-roles.repository";
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

  .get(
    "/me",
    async ({ dbUser }) => {
      const roles = await userRolesRepository.findByUserId(dbUser.id);
      return { ...dbUser, roles };
    },
    {
      detail: {
        description:
          "Returns the caller's user record with their roles. If no local row exists yet, one is lazily created from Clerk profile data on first call.",
        security: [{ bearerAuth: [] }],
        summary: "Get current authenticated user",
        tags: ["users"],
      },
      requireAuth: true,
      response: userResponseSchema,
    }
  )

  .put(
    "/me",
    async ({ dbUser, body }) => {
      const updated = await usersService.updateProfileById(dbUser.id, body);
      const roles = await userRolesRepository.findByUserId(dbUser.id);
      return { ...updated, roles };
    },

    {
      body: updateProfileBody,
      detail: {
        description: "Updates the first or last name of the authenticated user.",
        security: [{ bearerAuth: [] }],
        summary: "Update current user profile",
        tags: ["users"],
      },
      requireAuth: true,
      response: userResponseSchema,
    }
  )

  .get(
    "/me/addresses",
    async ({ dbUser }) => {
      return await usersService.getAddressesForUser(dbUser);
    },
    {
      detail: {
        description: "Returns the shipping and billing addresses linked to the authenticated user.",
        security: [{ bearerAuth: [] }],
        summary: "Get current user addresses",
        tags: ["users"],
      },
      requireAuth: true,
      response: addressesResponseSchema,
    }
  )

  .post(
    "/me/addresses",
    async ({ dbUser, body }) => {
      const { type, ...addressData } = body;
      return await usersService.upsertAddressForUser(dbUser.id, type, addressData);
    },
    {
      body: addressBody,
      detail: {
        description:
          "Creates a new address and links it as the shipping or billing address for the authenticated user. Replaces any previously linked address of the same type.",
        security: [{ bearerAuth: [] }],
        summary: "Set a shipping or billing address",
        tags: ["users"],
      },
      requireAuth: true,
      response: addressResponseSchema,
    }
  );
