import { Elysia, status, t } from "elysia";
import { errorResponse } from "../../utils/error-plugin";
import { authPlugin } from "../auth";
import { createWineBody, updateWineBody, wineFiltersQuery, wineResponse } from "./wines.schema";
import { winesService } from "./wines.service";

export const winesRoutes = new Elysia()
  .use(authPlugin)

  .get("/wines", ({ query }) => winesService.listWines(query), {
    detail: {
      description:
        "Returns all non-deleted wines. Filterable by region, type, color, vintageYear, winemakerId.",
      summary: "List wines",
      tags: ["wines"],
    },
    query: wineFiltersQuery,
    response: { 200: t.Array(wineResponse) },
  })

  .get("/wines/:id", ({ params }) => winesService.getWine(params.id), {
    detail: {
      description: "Returns a single wine with winemaker info. 404 if not found or deleted.",
      summary: "Get wine by ID",
      tags: ["wines"],
    },
    params: t.Object({ id: t.String() }),
    response: { 200: wineResponse, 404: errorResponse },
  })

  .post("/wines", ({ dbUser, body }) => winesService.createWine(dbUser.id, body), {
    body: createWineBody,
    detail: {
      description: "Creates a wine under the authenticated winemaker profile.",
      security: [{ bearerAuth: [] }],
      summary: "Create wine",
      tags: ["wines"],
    },
    requireRoles: ["winemaker"],
    response: { 200: wineResponse, 404: errorResponse },
  })

  .put(
    "/wines/:id",
    ({ params, dbUser, clerkPayload, body }) =>
      winesService.replaceWine(params.id, dbUser.id, clerkPayload.roles ?? [], body),
    {
      body: updateWineBody,
      detail: {
        description: "Full replacement of a wine. Must be own wine or admin.",
        security: [{ bearerAuth: [] }],
        summary: "Replace wine",
        tags: ["wines"],
      },
      params: t.Object({ id: t.String() }),
      requireRoles: ["winemaker", "admin"],
      response: { 200: wineResponse, 403: errorResponse, 404: errorResponse },
    }
  )

  .delete(
    "/wines/:id",
    async ({ params, dbUser, clerkPayload }) => {
      await winesService.deleteWine(params.id, dbUser.id, clerkPayload.roles ?? []);
      return status(204, null);
    },
    {
      detail: {
        description: "Soft-deletes a wine. Must be own wine or admin.",
        security: [{ bearerAuth: [] }],
        summary: "Delete wine",
        tags: ["wines"],
      },
      params: t.Object({ id: t.String() }),
      requireRoles: ["winemaker", "admin"],
      response: { 204: t.Null(), 403: errorResponse, 404: errorResponse },
    }
  );
