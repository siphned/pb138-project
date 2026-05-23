import { Elysia, t } from "elysia";
import { errorResponse } from "../../utils/error-plugin";
import { authPlugin } from "../auth";
import { supplyAgreementsService } from "./supply-agreements.service";

const agreementResponse = t.Object({
  createdAt: t.Date(),
  id: t.String(),
  respondedAt: t.Union([t.Date(), t.Null()]),
  shopId: t.String(),
  status: t.String(),
  winemakerId: t.String(),
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
      body: t.Object({
        shopId: t.String(),
        winemakerId: t.String(),
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
      body: t.Object({
        status: t.Union([t.Literal("approved"), t.Literal("rejected")]),
      }),
      detail: {
        description: "A winemaker approves or rejects a supply agreement request.",
        security: [{ bearerAuth: [] }],
        summary: "Respond to a supply agreement request",
      },
      params: t.Object({ id: t.String() }),
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
      params: t.Object({ shopId: t.String() }),
      requireRoles: ["shop_owner"],
      response: { 200: t.Array(agreementResponse), 403: errorResponse },
    }
  )

  .get("/winemaker", ({ dbUser }) => supplyAgreementsService.listForWinemaker(dbUser.id), {
    detail: {
      security: [{ bearerAuth: [] }],
      summary: "List supply agreements for the authenticated winemaker",
    },
    requireRoles: ["winemaker"],
    response: { 200: t.Array(agreementResponse), 403: errorResponse },
  });
