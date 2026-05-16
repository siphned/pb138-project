import { Elysia, status, t } from "elysia";
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

  .get(
    "/",
    async ({ query }) => {
      return await winemakersService.listWinemakers({ q: query.q });
    },
    {
      detail: {
        summary: "List all winemakers",
      },
      query: winemakerFiltersQuery,
      response: { 200: t.Array(winemakerListItemResponse) },
    }
  )

  .get(
    "/me",
    async ({ dbUser }) => {
      return await winemakersService.getMyProfile(dbUser.id);
    },
    {
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Get own winemaker profile",
      },
      requireRoles: ["winemaker"],
      response: { 200: winemakerListItemResponse, 404: errorResponse },
    }
  )

  .patch(
    "/me",
    // biome-ignore lint/suspicious/noExplicitAny: complex elysia type inference
    async ({ dbUser, body }: { dbUser: { id: string }; body: any }) => {
      try {
        return await winemakersService.updateMyProfile(dbUser.id, body);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND") {
          return status(404, "Winemaker profile not found");
        }
        throw e;
      }
    },
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
        summary: "Update own winemaker profile",
      },
      requireRoles: ["winemaker"],
      response: { 200: winemakerListItemResponse, 404: t.String() },
    }
  )

  .get(
    "/:id",
    async ({ params }: { params: { id: string } }) => {
      try {
        return await winemakersService.getWinemaker(params.id);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND") {
          return status(404, "Winemaker not found");
        }
        throw e;
      }
    },
    {
      detail: {
        summary: "Get winemaker by ID",
      },
      params: t.Object({ id: t.String() }),
      response: { 200: winemakerProfileResponse, 404: t.String() },
    }
  );
