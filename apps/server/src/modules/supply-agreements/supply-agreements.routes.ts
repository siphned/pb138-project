<<<<<<< HEAD
import { Elysia, t } from "elysia";
import { errorResponse } from "../../utils/error-plugin";
import { authPlugin } from "../auth";
import { supplyAgreementsService } from "./supply-agreements.service";

=======
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

>>>>>>> origin/main
const agreementResponse = t.Object({
  createdAt: t.Date(),
  id: t.String(),
  respondedAt: t.Union([t.Date(), t.Null()]),
  shopId: t.String(),
  status: t.String(),
  winemakerId: t.String(),
});

<<<<<<< HEAD
=======
const errorResponse = {
  403: t.String(),
  404: t.String(),
  422: t.String(),
};

>>>>>>> origin/main
export const supplyAgreementsRoutes = new Elysia({
  prefix: "/supply-agreements",
  tags: ["supply-agreements"],
})
  .use(authPlugin)

  .post(
    "/",
<<<<<<< HEAD
    ({ dbUser, body }) =>
      supplyAgreementsService.createRequest(dbUser.id, body.winemakerId, body.shopId),
=======
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
>>>>>>> origin/main
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
<<<<<<< HEAD
      response: { 200: agreementResponse, 403: errorResponse, 404: errorResponse },
=======
      response: { 200: agreementResponse, ...errorResponse },
>>>>>>> origin/main
    }
  )

  .patch(
    "/:id",
<<<<<<< HEAD
    ({ dbUser, params, body }) =>
      supplyAgreementsService.respondToRequest(dbUser.id, params.id, body.status),
=======
    async ({ dbUser, params, body }) => {
      try {
        return await supplyAgreementsService.respondToRequest(dbUser.id, params.id, body.status);
      } catch (e) {
        return handleError(e);
      }
    },
>>>>>>> origin/main
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
<<<<<<< HEAD
      response: {
        200: agreementResponse,
        403: errorResponse,
        404: errorResponse,
        409: errorResponse,
      },
=======
      response: { 200: agreementResponse, ...errorResponse },
>>>>>>> origin/main
    }
  )

  .get(
    "/shop/:shopId",
<<<<<<< HEAD
    ({ dbUser, params }) => supplyAgreementsService.listForShop(dbUser.id, params.shopId),
=======
    async ({ dbUser, params }) => {
      try {
        return await supplyAgreementsService.listForShop(dbUser.id, params.shopId);
      } catch (e) {
        return handleError(e);
      }
    },
>>>>>>> origin/main
    {
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "List supply agreements for a shop",
      },
      params: t.Object({ shopId: t.String() }),
      requireRoles: ["shop_owner"],
<<<<<<< HEAD
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
=======
      response: { 200: t.Array(agreementResponse), ...errorResponse },
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
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "List supply agreements for the authenticated winemaker",
      },
      requireRoles: ["winemaker"],
      response: { 200: t.Array(agreementResponse), ...errorResponse },
    }
  );
>>>>>>> origin/main
