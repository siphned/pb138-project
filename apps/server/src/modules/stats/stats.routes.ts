import { Elysia, t } from "elysia";
import { errorResponse } from "../../utils/error-plugin";
import { authPlugin } from "../auth";
import { statsService } from "./stats.service";

export const statsRoutes = new Elysia()
  .use(authPlugin)
  .get(
    "/stats",
    ({ dbUser, clerkPayload, query }) =>
      statsService.getStats(dbUser.id, query.role, clerkPayload.roles ?? []),
    {
      detail: {
        description:
          "Returns aggregate statistics for the authenticated caller scoped to the requested role. The caller must hold the requested role (any authenticated user may request customer stats).",
        security: [{ bearerAuth: [] }],
        summary: "Get role-scoped stats",
        tags: ["stats"],
      },
      query: t.Object({
        role: t.Union([
          t.Literal("customer"),
          t.Literal("winemaker"),
          t.Literal("shop_owner"),
          t.Literal("admin"),
        ]),
      }),
      requireAuth: true,
      response: { 200: t.Any(), 403: errorResponse, 404: errorResponse },
    }
  );
