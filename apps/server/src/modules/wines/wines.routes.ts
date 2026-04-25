import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { createWineBody, updateWineBody, wineFiltersQuery, wineResponse } from "./wines.schema";
import { winesService } from "./wines.service";

export const winesRoutes = new Elysia()
  .use(authPlugin)

  .get("/wines", ({ query }) => winesService.listWines(query), {
    query: wineFiltersQuery,
    response: { 200: t.Array(wineResponse) },
    detail: {
      tags: ["wines"],
      summary: "List wines",
      description:
        "Returns all non-deleted wines. Filterable by region, type, color, vintageYear, winemakerId.",
    },
  })

  .get(
    "/wines/:id",
    async ({ params }) => {
      try {
        return await winesService.getWine(params.id);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND") return status(404, "Wine not found");
        throw e;
      }
    },
    {
      params: t.Object({ id: t.String() }),
      response: { 200: wineResponse, 404: t.String() },
      detail: {
        tags: ["wines"],
        summary: "Get wine by ID",
        description: "Returns a single wine with winemaker info. 404 if not found or deleted.",
      },
    }
  )

  .post(
    "/wines",
    async ({ dbUser, body }) => {
      try {
        return status(201, await winesService.createWine(dbUser.id, body));
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND")
          return status(404, "Winemaker profile not found");
        throw e;
      }
    },
    {
      requireRoles: ["winemaker"],
      body: createWineBody,
      response: { 201: wineResponse, 404: t.String() },
      detail: {
        tags: ["wines"],
        summary: "Create wine",
        description: "Creates a wine under the authenticated winemaker profile.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .put(
    "/wines/:id",
    async ({ params, dbUser, clerkPayload, body }) => {
      try {
        return await winesService.replaceWine(params.id, dbUser.id, clerkPayload.roles ?? [], body);
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === "NOT_FOUND") return status(404, "Wine not found");
          if (e.message === "FORBIDDEN") return status(403, "You do not own this wine");
        }
        throw e;
      }
    },
    {
      requireAuth: true,
      params: t.Object({ id: t.String() }),
      body: updateWineBody,
      response: { 200: wineResponse, 403: t.String(), 404: t.String() },
      detail: {
        tags: ["wines"],
        summary: "Replace wine",
        description: "Full replacement of a wine. Must be own wine or admin.",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .delete(
    "/wines/:id",
    async ({ params, dbUser, clerkPayload }) => {
      try {
        await winesService.deleteWine(params.id, dbUser.id, clerkPayload.roles ?? []);
        return status(204, null);
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === "NOT_FOUND") return status(404, "Wine not found");
          if (e.message === "FORBIDDEN") return status(403, "You do not own this wine");
        }
        throw e;
      }
    },
    {
      requireAuth: true,
      params: t.Object({ id: t.String() }),
      response: { 204: t.Null(), 403: t.String(), 404: t.String() },
      detail: {
        tags: ["wines"],
        summary: "Delete wine",
        description: "Soft-deletes a wine. Must be own wine or admin.",
        security: [{ bearerAuth: [] }],
      },
    }
  );
