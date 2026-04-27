import { Elysia, status, t } from "elysia";
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
      detail: {
        description: "Returns a single wine with winemaker info. 404 if not found or deleted.",
        summary: "Get wine by ID",
        tags: ["wines"],
      },
      params: t.Object({ id: t.String() }),
      response: { 200: wineResponse, 404: t.String() },
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
      body: createWineBody,
      detail: {
        description: "Creates a wine under the authenticated winemaker profile.",
        security: [{ bearerAuth: [] }],
        summary: "Create wine",
        tags: ["wines"],
      },
      requireRoles: ["winemaker"],
      response: { 201: wineResponse, 404: t.String() },
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
      body: updateWineBody,
      detail: {
        description: "Full replacement of a wine. Must be own wine or admin.",
        security: [{ bearerAuth: [] }],
        summary: "Replace wine",
        tags: ["wines"],
      },
      params: t.Object({ id: t.String() }),
      requireRoles: ["winemaker", "admin"],
      response: { 200: wineResponse, 403: t.String(), 404: t.String() },
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
      detail: {
        description: "Soft-deletes a wine. Must be own wine or admin.",
        security: [{ bearerAuth: [] }],
        summary: "Delete wine",
        tags: ["wines"],
      },
      params: t.Object({ id: t.String() }),
      requireRoles: ["winemaker", "admin"],
      response: { 204: t.Null(), 403: t.String(), 404: t.String() },
    }
  );
