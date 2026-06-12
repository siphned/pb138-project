import { Elysia, status } from "elysia";
import { z } from "zod";
import { parsePagination } from "../../utils/pagination";
import { authPlugin } from "../auth";
import { adminService } from "./admin.service";

const idParams = z.object({ id: z.string() });

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .use(authPlugin)

  .get(
    "/users",
    async ({ query }) => {
      const { page, status, role } = query;
      return adminService.listUsers({ role, status }, parsePagination({ page }));
    },
    {
      detail: {
        description: "List users with optional status and role filters.",
        security: [{ bearerAuth: [] }],
        summary: "List users (admin)",
        tags: ["admin"],
      },
      query: z.object({
        page: z.coerce.number().optional(),
        role: z.enum(["customer", "winemaker", "shop_owner", "admin"]).optional(),
        status: z.enum(["active", "suspended", "banned"]).optional(),
      }),
      requireRoles: ["admin"],
    }
  )

  .get(
    "/users/:id",
    async ({ params }) => {
      try {
        return await adminService.getUser(params.id);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND") return status(404, "User not found");
        throw e;
      }
    },
    {
      detail: {
        description: "Get a single user by ID.",
        security: [{ bearerAuth: [] }],
        summary: "Get user by ID (admin)",
        tags: ["admin"],
      },
      params: idParams,
      requireRoles: ["admin"],
    }
  )

  .patch(
    "/users/:id/status",
    ({ params, body }) => adminService.setUserStatus(params.id, body.status),
    {
      body: z.object({
        status: z.enum(["active", "suspended", "banned"]),
      }),
      detail: {
        description: "Update a user's account status.",
        security: [{ bearerAuth: [] }],
        summary: "Set user status",
        tags: ["admin"],
      },
      params: idParams,
      requireRoles: ["admin"],
    }
  )

  .get(
    "/reviews",
    async ({ query }) => {
      const { page } = query;
      return adminService.listAllReviews(parsePagination({ page }));
    },
    {
      detail: {
        description: "List all reviews across the platform.",
        security: [{ bearerAuth: [] }],
        summary: "List reviews (admin)",
        tags: ["admin"],
      },
      query: z.object({ page: z.coerce.number().optional() }),
      requireRoles: ["admin"],
    }
  )

  .delete(
    "/reviews/:id",
    async ({ params }) => {
      await adminService.deleteReview(params.id);
      return { success: true };
    },
    {
      detail: {
        description: "Delete any review (moderation).",
        security: [{ bearerAuth: [] }],
        summary: "Delete review (admin)",
        tags: ["admin"],
      },
      params: idParams,
      requireRoles: ["admin"],
    }
  );
