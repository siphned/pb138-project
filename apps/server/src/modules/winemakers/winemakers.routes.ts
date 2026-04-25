import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { winemakerListItemResponse, winemakerProfileResponse } from "./winemakers.schema";
import { winemakersService } from "./winemakers.service";

export const winemakersRoutes = new Elysia({ prefix: "/winemakers", tags: ["winemakers"] })
  .use(authPlugin)

  // biome-ignore lint/suspicious/noExplicitAny: Elysia cannot infer Drizzle relation types against TypeBox schemas
  .get("/", () => winemakersService.listWinemakers() as any, {
    response: { 200: t.Array(winemakerListItemResponse) },
    detail: {
      summary: "List all winemakers",
    },
  })

  .patch(
    "/me",
    async ({ dbUser, body }) => {
      try {
        // biome-ignore lint/suspicious/noExplicitAny: Elysia cannot infer Drizzle relation types against TypeBox schemas
        return (await winemakersService.updateMyProfile(dbUser.id, body)) as any;
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND") {
          return status(404, "Winemaker profile not found");
        }
        throw e;
      }
    },
    {
      requireRoles: ["winemaker"],
      body: t.Partial(
        t.Object({
          name: t.String(),
          description: t.String(),
          websiteUrl: t.Union([t.String(), t.Null()]),
          phone: t.String(),
          email: t.String(),
        })
      ),
      response: { 200: winemakerListItemResponse, 404: t.String() },
      detail: {
        summary: "Update own winemaker profile",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .get(
    "/:id",
    async ({ params }) => {
      try {
        // biome-ignore lint/suspicious/noExplicitAny: Elysia cannot infer Drizzle relation types against TypeBox schemas
        return (await winemakersService.getWinemaker(params.id)) as any;
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND") {
          return status(404, "Winemaker not found");
        }
        throw e;
      }
    },
    {
      params: t.Object({ id: t.String() }),
      response: { 200: winemakerProfileResponse, 404: t.String() },
      detail: {
        summary: "Get winemaker by ID",
      },
    }
  );
