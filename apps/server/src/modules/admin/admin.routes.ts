import { Elysia, status, t } from "elysia";
import { errorResponse } from "../../utils/error-plugin";
import { authPlugin } from "../auth";
import { adminService } from "./admin.service";

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .use(authPlugin)

  .get(
    "/events",
    async ({ query }) => {
      const { page = 1, status = "pending" } = query;
      return adminService.listEvents({ status }, { offset: (page - 1) * 20 });
    },
    {
      detail: {
        description: "List events by status for moderation.",
        security: [{ bearerAuth: [] }],
        summary: "List events (admin)",
        tags: ["admin"],
      },
      query: t.Object({
        page: t.Optional(t.Numeric()),
        status: t.Optional(
          t.Union([t.Literal("pending"), t.Literal("approved"), t.Literal("rejected")])
        ),
      }),
      requireRoles: ["admin"],
      response: { 200: t.Any() },
    }
  )

  .post("/events/:id/approve", ({ params }) => adminService.approveEvent(params.id), {
    detail: {
      description: "Approve a pending event.",
      security: [{ bearerAuth: [] }],
      summary: "Approve event",
      tags: ["admin"],
    },
    params: t.Object({ id: t.String() }),
    requireRoles: ["admin"],
    response: { 200: t.Any(), 404: errorResponse },
  })

  .post("/events/:id/reject", ({ params }) => adminService.rejectEvent(params.id), {
    detail: {
      description: "Reject a pending event.",
      security: [{ bearerAuth: [] }],
      summary: "Reject event",
      tags: ["admin"],
    },
    params: t.Object({ id: t.String() }),
    requireRoles: ["admin"],
    response: { 200: t.Any(), 404: errorResponse },
  })

  .get(
    "/users",
    async ({ query }) => {
      const { page = 1, status, role } = query;
      return adminService.listUsers({ role, status }, { offset: (page - 1) * 20 });
    },
    {
      detail: {
        description: "List users with optional status and role filters.",
        security: [{ bearerAuth: [] }],
        summary: "List users (admin)",
        tags: ["admin"],
      },
      query: t.Object({
        page: t.Optional(t.Numeric()),
        role: t.Optional(t.String()),
        status: t.Optional(
          t.Union([t.Literal("active"), t.Literal("suspended"), t.Literal("banned")])
        ),
      }),
      requireRoles: ["admin"],
      response: { 200: t.Any() },
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
      params: t.Object({ id: t.String() }),
      requireRoles: ["admin"],
      response: { 200: t.Any(), 404: t.String() },
    }
  )

  .patch(
    "/users/:id/status",
    ({ params, body }) => adminService.setUserStatus(params.id, body.status),
    {
      body: t.Object({
        status: t.Union([t.Literal("active"), t.Literal("suspended"), t.Literal("banned")]),
      }),
      detail: {
        description: "Update a user's account status.",
        security: [{ bearerAuth: [] }],
        summary: "Set user status",
        tags: ["admin"],
      },
      params: t.Object({ id: t.String() }),
      requireRoles: ["admin"],
      response: { 200: t.Any(), 404: errorResponse },
    }
  )

  .get(
    "/reviews",
    async ({ query }) => {
      const { page = 1 } = query;
      return adminService.listAllReviews({ offset: (page - 1) * 20 });
    },
    {
      detail: {
        description: "List all reviews across the platform.",
        security: [{ bearerAuth: [] }],
        summary: "List reviews (admin)",
        tags: ["admin"],
      },
      query: t.Object({ page: t.Optional(t.Numeric()) }),
      requireRoles: ["admin"],
      response: { 200: t.Any() },
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
      params: t.Object({ id: t.String() }),
      requireRoles: ["admin"],
      response: { 200: t.Any(), 404: errorResponse },
    }
  );
