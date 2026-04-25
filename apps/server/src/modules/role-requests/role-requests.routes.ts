import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { usersService } from "../users/users.service";
import { roleRequestResponse, submitRoleRequestBody } from "./role-requests.schema";
import { roleRequestsService } from "./role-requests.service";

const successResponse = t.Object({ success: t.Boolean() });

export const roleRequestsRoutes = new Elysia()
  .use(authPlugin)

  .post(
    "/users/me/request-winemaker",
    async ({ clerkId, clerkPayload, body }) => {
      const user = await usersService.lazyGetOrCreate(clerkId, clerkPayload);
      try {
        return await roleRequestsService.submitRequest(
          user.id,
          "winemaker",
          body.businessName,
          body.details
        );
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "DUPLICATE_REQUEST")
          return status(409, "Pending request already exists");
        throw e;
      }
    },
    {
      requireAuth: true,
      body: submitRoleRequestBody,
      response: { 201: roleRequestResponse, 409: t.String() },
      detail: {
        tags: ["role-requests"],
        summary: "Apply for winemaker role",
        description:
          "Submit a pending winemaker role request. One pending request per role per user.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .post(
    "/users/me/request-shop-owner",
    async ({ clerkId, clerkPayload, body }) => {
      const user = await usersService.lazyGetOrCreate(clerkId, clerkPayload);
      try {
        return await roleRequestsService.submitRequest(
          user.id,
          "shop_owner",
          body.businessName,
          body.details
        );
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "DUPLICATE_REQUEST")
          return status(409, "Pending request already exists");
        throw e;
      }
    },
    {
      requireAuth: true,
      body: submitRoleRequestBody,
      response: { 201: roleRequestResponse, 409: t.String() },
      detail: {
        tags: ["role-requests"],
        summary: "Apply for shop-owner role",
        description:
          "Submit a pending shop-owner role request. One pending request per role per user.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .get("/role-requests", () => roleRequestsService.listPending(), {
    requireRoles: ["admin"],
    response: { 200: t.Array(roleRequestResponse) },
    detail: {
      tags: ["role-requests"],
      summary: "List pending role requests",
      description: "Admin-only. Returns all role requests with status `pending`.",
      security: [{ bearerAuth: [] }],
    },
  })

  .post(
    "/role-requests/:id/approve",
    async ({ params, clerkId, clerkPayload }) => {
      const admin = await usersService.lazyGetOrCreate(clerkId, clerkPayload);
      try {
        await roleRequestsService.approve(params.id, admin.id);
        return { success: true };
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === "NOT_FOUND") return status(404, "Role request not found");
          if (e.message === "NOT_PENDING") return status(409, "Request is not pending");
        }
        throw e;
      }
    },
    {
      requireRoles: ["admin"],
      params: t.Object({ id: t.String() }),
      response: { 200: successResponse, 404: t.String(), 409: t.String() },
      detail: {
        tags: ["role-requests"],
        summary: "Approve a role request",
        description:
          "Admin-only. Grants the requested capability in Clerk publicMetadata and marks the request as `approved`.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .post(
    "/role-requests/:id/reject",
    async ({ params, clerkId, clerkPayload }) => {
      const admin = await usersService.lazyGetOrCreate(clerkId, clerkPayload);
      try {
        await roleRequestsService.reject(params.id, admin.id);
        return { success: true };
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === "NOT_FOUND") return status(404, "Role request not found");
          if (e.message === "NOT_PENDING") return status(409, "Request is not pending");
        }
        throw e;
      }
    },
    {
      requireRoles: ["admin"],
      params: t.Object({ id: t.String() }),
      response: { 200: successResponse, 404: t.String(), 409: t.String() },
      detail: {
        tags: ["role-requests"],
        summary: "Reject a role request",
        description: "Admin-only. Marks the request as `rejected` without changing Clerk metadata.",
        security: [{ bearerAuth: [] }],
      },
    }
  );
