import { Elysia } from "elysia";
import { z } from "zod";
import { errorResponse } from "../../utils/error-plugin";
import { authPlugin } from "../auth";
import { supplyAgreementsService } from "./supply-agreements.service";

const agreementResponse = z.object({
  createdAt: z.date(),
  id: z.string(),
  respondedAt: z.date().nullable(),
  shopId: z.string(),
  status: z.string(),
  winemakerId: z.string(),
});

export const supplyAgreementsRoutes = new Elysia({
  prefix: "/supply-agreements",
  tags: ["supply-agreements"],
})
  .use(authPlugin)

  .post(
    "/",
    ({ dbUser, body }) =>
      supplyAgreementsService.createRequest(dbUser.id, body.winemakerId, body.shopId),
    {
      body: z.object({
        shopId: z.string(),
        winemakerId: z.string(),
      }),
      detail: {
        description: "A shop owner requests a supply agreement from a winemaker.",
        security: [{ bearerAuth: [] }],
        summary: "Create a supply agreement request",
      },
      requireRoles: ["shop_owner"],
      response: { 200: agreementResponse, 403: errorResponse, 404: errorResponse },
    }
  )

  .patch(
    "/:id",
    ({ dbUser, params, body }) =>
      supplyAgreementsService.respondToRequest(dbUser.id, params.id, body.status),
    {
      body: z.object({
        status: z.enum(["approved", "rejected"]),
      }),
      detail: {
        description: "A winemaker approves or rejects a supply agreement request.",
        security: [{ bearerAuth: [] }],
        summary: "Respond to a supply agreement request",
      },
      params: z.object({ id: z.string() }),
      requireRoles: ["winemaker"],
      response: {
        200: agreementResponse,
        403: errorResponse,
        404: errorResponse,
        409: errorResponse,
      },
    }
  )

  .get(
    "/shop/:shopId",
    ({ dbUser, params }) => supplyAgreementsService.listForShop(dbUser.id, params.shopId),
    {
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "List supply agreements for a shop",
      },
      params: z.object({ shopId: z.string() }),
      requireRoles: ["shop_owner"],
      response: { 200: z.array(agreementResponse), 403: errorResponse },
    }
  )

  .get("/winemaker", ({ dbUser }) => supplyAgreementsService.listForWinemaker(dbUser.id), {
    detail: {
      security: [{ bearerAuth: [] }],
      summary: "List supply agreements for the authenticated winemaker",
    },
    requireRoles: ["winemaker"],
    response: { 200: z.array(agreementResponse), 403: errorResponse },
  });
