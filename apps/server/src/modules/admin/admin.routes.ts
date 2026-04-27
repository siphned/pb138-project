import { Elysia, t } from "elysia";
import { handleError } from "../../utils/errors";
import { authPlugin } from "../auth";
import { adminEventResponse, adminReviewResponse, adminUserResponse } from "./admin.schema";
import { adminService } from "./admin.service";

export const createAdminRoutes = (auth = authPlugin) => {
  return (
    new Elysia({ prefix: "/admin", tags: ["admin"] })
      .use(auth)
      // User Management
      .get(
        "/users",
        (async ({ query }: { query: Record<string, string | undefined> }) => {
          const { limit, offset, status, role } = query;
          return await adminService.listUsers(
            {
              role: role as "user" | "admin" | undefined,
              status: status as "active" | "suspended" | "banned" | undefined,
            },
            {
              limit: limit ? Number(limit) : undefined,
              offset: offset ? Number(offset) : undefined,
            }
          );
        }) as never,
        {
          detail: {
            security: [{ bearerAuth: [] }],
            summary: "List and filter users",
          },
          query: t.Object({
            limit: t.Optional(t.String()),
            offset: t.Optional(t.String()),
            role: t.Optional(t.String()),
            status: t.Optional(t.String()),
          }),
          requireRoles: ["admin"],
          response: {
            200: t.Object({
              data: t.Array(adminUserResponse),
              total: t.Number(),
            }),
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
            return handleError(e);
          }
        }) as never,
        {
          body: t.Object({
            status: t.Union([t.Literal("active"), t.Literal("suspended"), t.Literal("banned")]),
          }),
          detail: {
            security: [{ bearerAuth: [] }],
            summary: "Update user status",
          },
          params: t.Object({ id: t.String() }),
          requireRoles: ["admin"],
          response: { 200: adminUserResponse, 404: t.String() },
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
          detail: {
            security: [{ bearerAuth: [] }],
            summary: "List events for moderation",
          },
          query: t.Object({
            limit: t.Optional(t.String()),
            offset: t.Optional(t.String()),
            status: t.Optional(t.String()),
          }),
          requireRoles: ["admin"],
          response: {
            200: t.Object({
              data: t.Array(adminEventResponse),
              total: t.Number(),
            }),
          },
        }
      )

      .patch(
        "/events/:id/approve",
        (async ({ params }: { params: { id: string } }) => {
          try {
            return await adminService.approveEvent(params.id);
          } catch (e: unknown) {
            return handleError(e);
          }
        }) as never,
        {
          detail: {
            security: [{ bearerAuth: [] }],
            summary: "Approve a pending event",
          },
          params: t.Object({ id: t.String() }),
          requireRoles: ["admin"],
          response: { 200: adminEventResponse, 400: t.String(), 404: t.String() },
        }
      )

      .patch(
        "/events/:id/reject",
        (async ({ params }: { params: { id: string } }) => {
          try {
            return await adminService.rejectEvent(params.id);
          } catch (e: unknown) {
            return handleError(e);
          }
        }) as never,
        {
          detail: {
            security: [{ bearerAuth: [] }],
            summary: "Reject a pending event",
          },
          params: t.Object({ id: t.String() }),
          requireRoles: ["admin"],
          response: { 200: adminEventResponse, 400: t.String(), 404: t.String() },
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
          detail: {
            security: [{ bearerAuth: [] }],
            summary: "List all reviews for moderation",
          },
          query: t.Object({
            limit: t.Optional(t.String()),
            offset: t.Optional(t.String()),
          }),
          requireRoles: ["admin"],
          response: {
            200: t.Object({
              data: t.Array(adminReviewResponse),
              total: t.Number(),
            }),
          },
        }
      )

      .delete(
        "/reviews/:id",
        (async ({ params }: { params: { id: string } }) => {
          try {
            await adminService.deleteReview(params.id);
            return { success: true };
          } catch (e: unknown) {
            return handleError(e);
          }
        }) as never,
        {
          detail: {
            security: [{ bearerAuth: [] }],
            summary: "Soft-delete a review",
          },
          params: t.Object({ id: t.String() }),
          requireRoles: ["admin"],
          response: { 200: t.Object({ success: t.Boolean() }), 404: t.String() },
        }
      )
  );
};

export const adminRoutes = createAdminRoutes();
