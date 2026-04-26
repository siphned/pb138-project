import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { winemakerListItemResponse, winemakerProfileResponse } from "./winemakers.schema";
import { winemakersService } from "./winemakers.service";

export const winemakersRoutes = new Elysia({ prefix: "/winemakers", tags: ["winemakers"] })
  .use(authPlugin)

  .get("/", () => winemakersService.listWinemakers() as never, {
    detail: {
      summary: "List all winemakers",
    },
    response: { 200: t.Array(winemakerListItemResponse) },
  })

  .patch(
    "/me",
    async ({ dbUser, body }) => {
      try {
        return (await winemakersService.updateMyProfile(dbUser.id, body)) as never;
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
    async ({ params }) => {
      try {
        return (await winemakersService.getWinemaker(params.id)) as never;
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
