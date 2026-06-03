import { Elysia } from "elysia";
import { z } from "zod";
import { errorResponse } from "../../utils/error-plugin";
import { authPlugin } from "../auth";
import {
  updateWinemakerBody,
  winemakerFiltersQuery,
  winemakerListItemResponse,
  winemakerProfileResponse,
} from "./winemakers.schema";
import { winemakersService } from "./winemakers.service";

const idParams = z.object({ id: z.string() });

export const winemakersRoutes = new Elysia({ prefix: "/winemakers", tags: ["winemakers"] })
  .use(authPlugin)

  .get("/", ({ query }) => winemakersService.listWinemakers({ q: query.q }), {
    detail: { summary: "List all winemakers" },
    query: winemakerFiltersQuery,
    response: { 200: z.array(winemakerListItemResponse) },
  })

  .get("/me", ({ dbUser }) => winemakersService.getMyProfile(dbUser.id), {
    detail: {
      security: [{ bearerAuth: [] }],
      summary: "Get own winemaker profile",
    },
    requireRoles: ["winemaker"],
    response: { 200: winemakerListItemResponse, 404: errorResponse },
  })

  .patch("/me", ({ dbUser, body }) => winemakersService.updateMyProfile(dbUser.id, body), {
    body: updateWinemakerBody,
    detail: {
      security: [{ bearerAuth: [] }],
      summary: "Update own winemaker profile",
    },
    requireRoles: ["winemaker"],
    response: { 200: winemakerListItemResponse, 404: errorResponse },
  })

  .get("/:id", ({ params }) => winemakersService.getWinemaker(params.id), {
    detail: { summary: "Get winemaker by ID" },
    params: idParams,
    response: { 200: winemakerProfileResponse, 404: errorResponse },
  })

  .patch(
    "/:id",
    ({ params, dbUser, clerkPayload, body }) =>
      winemakersService.updateWinemakerById(params.id, dbUser.id, clerkPayload.roles ?? [], body),
    {
      body: updateWinemakerBody,
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Update winemaker profile by ID (owner or admin)",
      },
      params: idParams,
      requireRoles: ["winemaker", "admin"],
      response: { 200: winemakerListItemResponse, 403: errorResponse, 404: errorResponse },
    }
  );
