import { Elysia, t } from "elysia";
import { errorResponse } from "../../utils/error-plugin";
import { authPlugin } from "../auth";
import {
  winemakerFiltersQuery,
  winemakerListItemResponse,
  winemakerProfileResponse,
} from "./winemakers.schema";
import { winemakersService } from "./winemakers.service";

export const winemakersRoutes = new Elysia({ prefix: "/winemakers", tags: ["winemakers"] })
  .use(authPlugin)

  .get("/", ({ query }) => winemakersService.listWinemakers({ q: query.q }), {
    detail: { summary: "List all winemakers" },
    query: winemakerFiltersQuery,
    response: { 200: t.Array(winemakerListItemResponse) },
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
    body: t.Partial(
      t.Object({
        description: t.String(),
        email: t.String(),
        name: t.String(),
        phone: t.String(),
        websiteUrl: t.Union([t.String(), t.Null()]),
      })
    ),
    detail: {
      security: [{ bearerAuth: [] }],
      summary: "Update own winemaker profile",
    },
    requireRoles: ["winemaker"],
    response: { 200: winemakerListItemResponse, 404: errorResponse },
  })

  .get("/:id", ({ params }) => winemakersService.getWinemaker(params.id), {
    detail: { summary: "Get winemaker by ID" },
    params: t.Object({ id: t.String() }),
    response: { 200: winemakerProfileResponse, 404: errorResponse },
  })

  .patch(
    "/:id",
    ({ params, dbUser, clerkPayload, body }) =>
      winemakersService.updateWinemakerById(params.id, dbUser.id, clerkPayload.roles ?? [], body),
    {
      body: t.Partial(
        t.Object({
          description: t.String(),
          email: t.String(),
          name: t.String(),
          phone: t.String(),
          websiteUrl: t.Union([t.String(), t.Null()]),
        })
      ),
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Update winemaker profile by ID (owner or admin)",
      },
      params: t.Object({ id: t.String() }),
      requireRoles: ["winemaker", "admin"],
      response: { 200: winemakerListItemResponse, 403: errorResponse, 404: errorResponse },
    }
  );
