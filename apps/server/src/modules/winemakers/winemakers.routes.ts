import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { winemakerListItemResponse, winemakerProfileResponse } from "./winemakers.schema";
import { winemakersService } from "./winemakers.service";

export const winemakersRoutes = new Elysia({ prefix: "/winemakers", tags: ["winemakers"] })
  .use(authPlugin)

  .get(
    "/",
    (async () => {
      return await winemakersService.listWinemakers();
      // biome-ignore lint/suspicious/noExplicitAny: elysia type complexity
    }) as any,
    {
      response: { 200: t.Array(winemakerListItemResponse) },
      detail: {
        summary: "List all winemakers",
      },
    }
  )

  .patch(
    "/me",
    // biome-ignore lint/suspicious/noExplicitAny: elysia type complexity
    (async ({ dbUser, body }: any) => {
      try {
        return await winemakersService.updateMyProfile(dbUser.id, body);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND") {
          return status(404, "Winemaker profile not found");
        }
        throw e;
      }
      // biome-ignore lint/suspicious/noExplicitAny: elysia type complexity
    }) as any,
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
    // biome-ignore lint/suspicious/noExplicitAny: elysia type complexity
    (async ({ params }: any) => {
      try {
        return await winemakersService.getWinemaker(params.id);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "NOT_FOUND") {
          return status(404, "Winemaker not found");
        }
        throw e;
      }
      // biome-ignore lint/suspicious/noExplicitAny: elysia type complexity
    }) as any,
    {
      params: t.Object({ id: t.String() }),
      response: { 200: winemakerProfileResponse, 404: t.String() },
      detail: {
        summary: "Get winemaker by ID",
      },
    }
  );
