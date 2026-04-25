import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { supplyAgreementsService } from "./supply-agreements.service";

function handleError(e: unknown) {
  if (e instanceof Error) {
    if (e.message === "NOT_FOUND") return status(404, "Not found");
    if (e.message === "FORBIDDEN") return status(403, "Forbidden");
    if (e.message === "ALREADY_RESPONDED") return status(422, "Already responded to this request");
    if (e.message === "NOT_A_WINEMAKER") return status(403, "User is not a winemaker");
  }
  throw e;
}

const agreementResponse = t.Object({
  id: t.String(),
  shopId: t.String(),
  winemakerId: t.String(),
  status: t.String(),
  createdAt: t.Date(),
  respondedAt: t.Union([t.Date(), t.Null()]),
});

const errorResponse = {
  403: t.String(),
  404: t.String(),
  422: t.String(),
};

export const supplyAgreementsRoutes = new Elysia({
  prefix: "/supply-agreements",
  tags: ["supply-agreements"],
})
  .use(authPlugin)

  .post(
    "/",
    async ({ dbUser, body }) => {
      try {
        return await supplyAgreementsService.createRequest(
          dbUser.id,
          body.winemakerId,
          body.shopId
        );
      } catch (e) {
        return handleError(e);
      }
    },
    {
      requireRoles: ["shop_owner"],
      body: t.Object({
        winemakerId: t.String(),
        shopId: t.String(),
      }),
      response: { 200: agreementResponse, ...errorResponse },
      detail: {
        summary: "Create a supply agreement request",
        description: "A shop owner requests a supply agreement from a winemaker.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .patch(
    "/:id",
    async ({ dbUser, params, body }) => {
      try {
        return await supplyAgreementsService.respondToRequest(dbUser.id, params.id, body.status);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      requireRoles: ["winemaker"],
      params: t.Object({ id: t.String() }),
      body: t.Object({
        status: t.Union([t.Literal("approved"), t.Literal("rejected")]),
      }),
      response: { 200: agreementResponse, ...errorResponse },
      detail: {
        summary: "Respond to a supply agreement request",
        description: "A winemaker approves or rejects a supply agreement request.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .get(
    "/shop/:shopId",
    async ({ dbUser, params }) => {
      try {
        return await supplyAgreementsService.listForShop(dbUser.id, params.shopId);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      requireRoles: ["shop_owner"],
      params: t.Object({ shopId: t.String() }),
      response: { 200: t.Array(agreementResponse), ...errorResponse },
      detail: {
        summary: "List supply agreements for a shop",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .get(
    "/winemaker",
    async ({ dbUser }) => {
      try {
        return await supplyAgreementsService.listForWinemaker(dbUser.id);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      requireRoles: ["winemaker"],
      response: { 200: t.Array(agreementResponse), ...errorResponse },
      detail: {
        summary: "List supply agreements for the authenticated winemaker",
        security: [{ bearerAuth: [] }],
      },
    }
  );
