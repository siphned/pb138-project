import { Elysia, status } from "elysia";
import { z } from "zod";
import { authPlugin } from "../auth";
import { guestSessionsService } from "./guest-sessions.service";

const sessionResponse = z.object({
  createdAt: z.date(),
  expiresAt: z.date(),
  id: z.string(),
});

export const guestSessionsRoutes = new Elysia({
  prefix: "/guest-sessions",
  tags: ["guest-sessions"],
})
  .use(authPlugin)

  .post(
    "/",
    async ({ set }) => {
      const session = await guestSessionsService.getOrCreateSession();
      set.status = 201;
      return session;
    },
    {
      detail: {
        description:
          "Creates a new anonymous session record and returns the session ID in the response body. Used for guest carts and temporary state.",
        summary: "Initialize guest session",
      },
      response: sessionResponse,
    }
  )

  .get(
    "/:id",
    async ({ params }) => {
      const session = await guestSessionsService.validateSession(params.id);
      if (!session) return status(404, "Session not found or expired");
      return session;
    },
    {
      detail: {
        description: "Returns metadata for an existing guest session if it has not expired.",
        summary: "Validate guest session",
      },
      params: z.object({ id: z.string() }),
      response: {
        200: sessionResponse,
        404: z.string(),
      },
    }
  );
