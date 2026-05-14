import { Elysia, status, t } from "elysia";
import { errorResponse } from "../../utils/error-plugin";
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
    async ({ dbUser, body }) => {
      const result = await roleRequestsService.submitRequest(
        dbUser.id,
        body.type,
        body.businessName,
        body.details
      );
      return status(201, result);
    },
    {
      body: roleRequestBody,
      detail: {
        description: "Submit a request to become a winemaker or shop owner.",
        security: [{ bearerAuth: [] }],
        summary: "Submit a role request",
      },
      requireAuth: true,
      response: { 201: roleRequestResponse, 409: errorResponse },
    }
  )

  .get("/", () => roleRequestsService.listPending(), {
    detail: {
      security: [{ bearerAuth: [] }],
      summary: "List pending role requests",
    },
    requireRoles: ["admin"],
    response: { 200: t.Array(roleRequestResponse) },
  })

  .patch(
    "/:id/approve",
    ({ dbUser, params }) => roleRequestsService.approve(params.id, dbUser.id),
    {
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Approve a role request",
      },
      params: t.Object({ id: t.String() }),
      requireRoles: ["admin"],
      response: { 200: roleRequestResponse, 404: errorResponse, 409: errorResponse },
    }
  )

  .patch("/:id/reject", ({ dbUser, params }) => roleRequestsService.reject(params.id, dbUser.id), {
    detail: {
      security: [{ bearerAuth: [] }],
      summary: "Reject a role request",
    },
    params: t.Object({ id: t.String() }),
    requireRoles: ["admin"],
    response: { 200: roleRequestResponse, 404: errorResponse, 409: errorResponse },
  });
