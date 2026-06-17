import { Elysia, status } from "elysia";
import { z } from "zod";
import { errorResponse } from "../../utils/error-plugin";
import { authPlugin } from "../auth";
import { roleRequestsService } from "./role-requests.service";

const roleRequestBody = z.object({
  businessName: z.string(),
  details: z.string().optional(),
  type: z.enum(["winemaker", "shop_owner"]),
});

const roleRequestResponse = z.object({
  businessName: z.string(),
  details: z.string().nullable(),
  id: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
  submittedAt: z.any(),
  type: z.enum(["winemaker", "shop_owner"]),
  userId: z.string(),
});

const idParams = z.object({ id: z.string() });

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
    response: { 200: z.array(roleRequestResponse) },
  })

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
      params: idParams,
      requireRoles: ["admin"],
      response: { 200: roleRequestResponse, 404: z.string() },
    }
  )

  .patch(
    "/:id/approve",
    ({ dbUser, params }) => roleRequestsService.approve(params.id, dbUser.id),
    {
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Approve a role request",
      },
      params: idParams,
      requireRoles: ["admin"],
      response: { 200: roleRequestResponse, 404: errorResponse, 409: errorResponse },
    }
  )

  .patch("/:id/reject", ({ dbUser, params }) => roleRequestsService.reject(params.id, dbUser.id), {
    detail: {
      security: [{ bearerAuth: [] }],
      summary: "Reject a role request",
    },
    params: idParams,
    requireRoles: ["admin"],
    response: { 200: roleRequestResponse, 404: errorResponse, 409: errorResponse },
  });
