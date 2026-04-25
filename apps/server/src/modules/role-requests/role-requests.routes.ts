import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { roleRequestsService } from "./role-requests.service";

const roleRequestBody = t.Object({
  type: t.Union([t.Literal("winemaker"), t.Literal("shop_owner")]),
  businessName: t.String(),
  details: t.Optional(t.String()),
});

const roleRequestResponse = t.Object({
  id: t.String(),
  userId: t.String(),
  type: t.Union([t.Literal("winemaker"), t.Literal("shop_owner")]),
  status: t.Union([t.Literal("pending"), t.Literal("approved"), t.Literal("rejected")]),
  businessName: t.String(),
  details: t.Union([t.String(), t.Null()]),
  submittedAt: t.Date(),
});

export const roleRequestsRoutes = new Elysia({
  prefix: "/role-requests",
  tags: ["role-requests"],
})
  .use(authPlugin)

  .post(
    "/",
    async ({ dbUser, body }) => {
      try {
        return status(
          201,
          await roleRequestsService.submitRequest(
            dbUser.id,
            body.type,
            body.businessName,
            body.details
          )
        );
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "ALREADY_HAS_PENDING_REQUEST") {
          return status(409, "You already have a pending request for this role");
        }
        throw e;
      }
    },
    {
      requireAuth: true,
      body: roleRequestBody,
      response: { 201: roleRequestResponse, 409: t.String() },
      detail: {
        summary: "Submit a role request",
        description: "Submit a request to become a winemaker or shop owner.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .get("/", () => roleRequestsService.listPending(), {
    requireRoles: ["admin"],
    response: { 200: t.Array(roleRequestResponse) },
    detail: {
      summary: "List pending role requests",
      security: [{ bearerAuth: [] }],
    },
  })

  .patch(
    "/:id/approve",
    async ({ dbUser, params }) => {
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
      requireRoles: ["admin"],
      params: t.Object({ id: t.String() }),
      response: { 200: roleRequestResponse, 400: t.String(), 404: t.String() },
      detail: {
        summary: "Approve a role request",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .patch(
    "/:id/reject",
    async ({ dbUser, params }) => {
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
      requireRoles: ["admin"],
      params: t.Object({ id: t.String() }),
      response: { 200: roleRequestResponse, 400: t.String(), 404: t.String() },
      detail: {
        summary: "Reject a role request",
        security: [{ bearerAuth: [] }],
      },
    }
  );
