import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { roleRequestsService } from "./role-requests.service";

const roleRequestBody = t.Object({
  businessName: t.String(),
  details: t.Optional(t.String()),
  type: t.Union([t.Literal("winemaker"), t.Literal("shop_owner")]),
});

const roleRequestResponse = t.Object({
  businessName: t.String(),
  details: t.Union([t.String(), t.Null()]),
  id: t.String(),
  status: t.Union([t.Literal("pending"), t.Literal("approved"), t.Literal("rejected")]),
  submittedAt: t.Any(),
  type: t.Union([t.Literal("winemaker"), t.Literal("shop_owner")]),
  userId: t.String(),
});

export const roleRequestsRoutes = new Elysia({
  prefix: "/role-requests",
  tags: ["role-requests"],
})
  .use(authPlugin)

  .post(
    "/",
    // biome-ignore lint/suspicious/noExplicitAny: complex elysia type inference
    async ({ dbUser, body }: { dbUser: { id: string }; body: any }) => {
      try {
        const result = await roleRequestsService.submitRequest(
          dbUser.id,
          body.type,
          body.businessName,
          body.details
        );
        return status(201, result);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "ALREADY_HAS_PENDING_REQUEST") {
          return status(409, "You already have a pending request for this role");
        }
        throw e;
      }
    },
    {
      body: roleRequestBody,
      detail: {
        description: "Submit a request to become a winemaker or shop owner.",
        security: [{ bearerAuth: [] }],
        summary: "Submit a role request",
      },
      requireAuth: true,
      response: { 201: roleRequestResponse, 409: t.String() },
    }
  )

  .get(
    "/",
    async () => {
      return await roleRequestsService.listPending();
    },
    {
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "List pending role requests",
      },
      requireRoles: ["admin"],
      response: { 200: t.Array(roleRequestResponse) },
    }
  )

  .get(
    "/:id",
    async ({ params }) => {
      try {
        return await roleRequestsService.getById(params.id);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND")
          return status(404, "Request not found");
        throw e;
      }
    },
    {
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Get a role request by ID",
      },
      params: t.Object({ id: t.String() }),
      requireRoles: ["admin"],
      response: { 200: roleRequestResponse, 404: t.String() },
    }
  )

  .patch(
    "/:id/approve",
    async ({ dbUser, params }: { dbUser: { id: string }; params: { id: string } }) => {
      try {
        return await roleRequestsService.approve(params.id, dbUser.id);
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === "NOT_FOUND") return status(404, "Request not found");
          if (e.message === "ALREADY_RESPONDED") return status(400, "Request already processed");
        }
        throw e;
      }
    },
    {
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Approve a role request",
      },
      params: t.Object({ id: t.String() }),
      requireRoles: ["admin"],
      response: { 200: roleRequestResponse, 400: t.String(), 404: t.String() },
    }
  )

  .patch(
    "/:id/reject",
    async ({ dbUser, params }: { dbUser: { id: string }; params: { id: string } }) => {
      try {
        return await roleRequestsService.reject(params.id, dbUser.id);
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === "NOT_FOUND") return status(404, "Request not found");
          if (e.message === "ALREADY_RESPONDED") return status(400, "Request already processed");
        }
        throw e;
      }
    },
    {
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Reject a role request",
      },
      params: t.Object({ id: t.String() }),
      requireRoles: ["admin"],
      response: { 200: roleRequestResponse, 400: t.String(), 404: t.String() },
    }
  );
