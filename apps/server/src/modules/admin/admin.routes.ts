import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { adminEventResponse, adminReviewResponse, adminUserResponse } from "./admin.schema";
import { adminService } from "./admin.service";

export const adminRoutes = new Elysia({ prefix: "/admin", tags: ["admin"] })
  .use(authPlugin)

  // User Management
  .get(
    "/users",
    (async ({ query }: { query: Record<string, string | undefined> }) => {
      const { limit, offset, status, role } = query;
      return await adminService.listUsers(
        {
          status: status as "active" | "suspended" | "banned" | undefined,
          role: role as "user" | "admin" | undefined,
        },
        {
          limit: limit ? Number(limit) : undefined,
          offset: offset ? Number(offset) : undefined,
        }
      );
    }) as never,
    {
      requireRoles: ["admin"],
      query: t.Object({
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
        status: t.Optional(t.String()),
        role: t.Optional(t.String()),
      }),
      response: {
        200: t.Object({
          data: t.Array(adminUserResponse),
          total: t.Number(),
        }),
      },
      detail: {
        summary: "List and filter users",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .patch(
    "/users/:id/status",
    (async ({
      params,
      body,
    }: {
      params: { id: string };
      body: { status: "active" | "suspended" | "banned" };
    }) => {
      try {
        return await adminService.setUserStatus(params.id, body.status);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND") return status(404, "User not found");
        throw e;
      }
    }) as never,
    {
      requireRoles: ["admin"],
      params: t.Object({ id: t.String() }),
      body: t.Object({
        status: t.Union([t.Literal("active"), t.Literal("suspended"), t.Literal("banned")]),
      }),
      response: { 200: adminUserResponse, 404: t.String() },
      detail: {
        summary: "Update user status",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Content Moderation - Events
  .get(
    "/events",
    (async ({ query }: { query: Record<string, string | undefined> }) => {
      const { limit, offset, status = "pending" } = query;
      return await adminService.listEvents(
        { status: status as "pending" | "approved" | "rejected" },
        {
          limit: limit ? Number(limit) : undefined,
          offset: offset ? Number(offset) : undefined,
        }
      );
    }) as never,
    {
      requireRoles: ["admin"],
      query: t.Object({
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
        status: t.Optional(t.String()),
      }),
      response: {
        200: t.Object({
          data: t.Array(adminEventResponse),
          total: t.Number(),
        }),
      },
      detail: {
        summary: "List events for moderation",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .patch(
    "/events/:id/approve",
    (async ({ params }: { params: { id: string } }) => {
      try {
        return await adminService.approveEvent(params.id);
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === "NOT_FOUND") return status(404, "Event not found");
          if (e.message === "NOT_PENDING") return status(400, "Event is not pending");
        }
        throw e;
      }
    }) as never,
    {
      requireRoles: ["admin"],
      params: t.Object({ id: t.String() }),
      response: { 200: adminEventResponse, 400: t.String(), 404: t.String() },
      detail: {
        summary: "Approve a pending event",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .patch(
    "/events/:id/reject",
    (async ({ params }: { params: { id: string } }) => {
      try {
        return await adminService.rejectEvent(params.id);
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === "NOT_FOUND") return status(404, "Event not found");
          if (e.message === "NOT_PENDING") return status(400, "Event is not pending");
        }
        throw e;
      }
    }) as never,
    {
      requireRoles: ["admin"],
      params: t.Object({ id: t.String() }),
      response: { 200: adminEventResponse, 400: t.String(), 404: t.String() },
      detail: {
        summary: "Reject a pending event",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  // Content Moderation - Reviews
  .get(
    "/reviews",
    (async ({ query }: { query: Record<string, string | undefined> }) => {
      const { limit, offset } = query;
      return await adminService.listAllReviews({
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });
    }) as never,
    {
      requireRoles: ["admin"],
      query: t.Object({
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
      }),
      response: {
        200: t.Object({
          data: t.Array(adminReviewResponse),
          total: t.Number(),
        }),
      },
      detail: {
        summary: "List all reviews for moderation",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .delete(
    "/reviews/:id",
    (async ({ params }: { params: { id: string } }) => {
      try {
        await adminService.deleteReview(params.id);
        return status(204, null);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND") return status(404, "Review not found");
        throw e;
      }
    }) as never,
    {
      requireRoles: ["admin"],
      params: t.Object({ id: t.String() }),
      response: { 204: t.Null(), 404: t.String() },
      detail: {
        summary: "Soft-delete a review",
        security: [{ bearerAuth: [] }],
      },
    }
  );
