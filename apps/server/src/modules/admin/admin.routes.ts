import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import {
  adminEventSchema,
  adminUserSchema,
  paginatedEventsSchema,
  paginatedReviewsSchema,
  paginatedUsersSchema,
  updateEventStatusBody,
  updateUserStatusBody,
} from "./admin.schema";
import { adminService } from "./admin.service";

function handleError(e: unknown) {
  if (e instanceof Error) {
    if (e.message === "NOT_FOUND") return status(404, "Not found");
    if (e.message === "CONFLICT") return status(409, "Conflict");
  }
  throw e;
}

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .use(authPlugin)

  .get(
    "/users",
    async ({ query }) => {
      const { page, limit, status: userStatus, role } = query;
      return adminService.listUsers({ status: userStatus, role }, { page, limit });
    },
    {
      requireRole: "admin",
      query: t.Object({
        page: t.Optional(t.Number({ minimum: 1 })),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
        status: t.Optional(
          t.Union([t.Literal("active"), t.Literal("suspended"), t.Literal("banned")])
        ),
        role: t.Optional(t.Union([t.Literal("user"), t.Literal("admin")])),
      }),
      response: { 200: paginatedUsersSchema },
      detail: {
        tags: ["admin"],
        summary: "List all users",
        description:
          "Admin-only. Returns a paginated list of all non-deleted users. Filter by status or role.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .patch(
    "/users/:id/status",
    async ({ params, body }) => {
      try {
        return await adminService.changeUserStatus(params.id, body.status);
      } catch (e: unknown) {
        return handleError(e);
      }
    },
    {
      requireRole: "admin",
      params: t.Object({ id: t.String() }),
      body: updateUserStatusBody,
      response: { 200: adminUserSchema, 404: t.String(), 409: t.String() },
      detail: {
        tags: ["admin"],
        summary: "Update user status",
        description: "Admin-only. Sets a user's status to active, suspended, or banned.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .get(
    "/events",
    async ({ query }) => {
      const { page, limit, status: eventStatus } = query;
      return adminService.listEvents({ status: eventStatus }, { page, limit });
    },
    {
      requireRole: "admin",
      query: t.Object({
        page: t.Optional(t.Number({ minimum: 1 })),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
        status: t.Optional(
          t.Union([t.Literal("pending"), t.Literal("approved"), t.Literal("rejected")])
        ),
      }),
      response: { 200: paginatedEventsSchema },
      detail: {
        tags: ["admin"],
        summary: "List events by status",
        description:
          "Admin-only. Returns paginated events. Defaults to pending events requiring moderation.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .patch(
    "/events/:id/status",
    async ({ params, body }) => {
      try {
        return await adminService.setEventStatus(params.id, body.status);
      } catch (e: unknown) {
        return handleError(e);
      }
    },
    {
      requireRole: "admin",
      params: t.Object({ id: t.String() }),
      body: updateEventStatusBody,
      response: { 200: adminEventSchema, 404: t.String(), 409: t.String() },
      detail: {
        tags: ["admin"],
        summary: "Approve or reject an event",
        description:
          "Admin-only. Transitions a pending event to approved or rejected. Returns 409 if event is not pending.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .get(
    "/reviews",
    async ({ query }) => {
      const { page, limit } = query;
      return adminService.listReviews({ page, limit });
    },
    {
      requireRole: "admin",
      query: t.Object({
        page: t.Optional(t.Number({ minimum: 1 })),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
      }),
      response: { 200: paginatedReviewsSchema },
      detail: {
        tags: ["admin"],
        summary: "List all reviews",
        description:
          "Admin-only. Returns all product and winemaker reviews combined, ordered by createdAt descending.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .delete(
    "/reviews/:id",
    async ({ params, query }) => {
      try {
        await adminService.deleteReview(params.id, query.type);
        return status(204, null);
      } catch (e: unknown) {
        return handleError(e);
      }
    },
    {
      requireRole: "admin",
      params: t.Object({ id: t.String() }),
      query: t.Object({
        type: t.Union([t.Literal("product"), t.Literal("winemaker")]),
      }),
      response: { 204: t.Null(), 404: t.String(), 409: t.String() },
      detail: {
        tags: ["admin"],
        summary: "Delete a review",
        description:
          "Admin-only. Soft-deletes a product or winemaker review. Requires ?type=product|winemaker.",
        security: [{ bearerAuth: [] }],
      },
    }
  );
