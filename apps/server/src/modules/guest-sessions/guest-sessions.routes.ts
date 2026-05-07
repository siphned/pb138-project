import { Elysia, t } from "elysia";
import { db } from "../../db";
import { authPlugin } from "../auth";
import * as guestSessionsRepo from "./guest-sessions.repository";
import { guestSessionsService } from "./guest-sessions.service";

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
      response: t.Object({
        createdAt: t.Date(),
        expiresAt: t.Date(),
        id: t.String(),
      }),
    }
  )

  .get(
    "/:id",
    async ({ params }) => {
      const session = await guestSessionsRepo.findById(db, params.id);
      if (!session || session.expiresAt < new Date()) {
        throw new Error("NOT_FOUND");
      }
      return session;
    },
    {
      detail: {
        description: "Returns metadata for an existing guest session if it has not expired.",
        summary: "Validate guest session",
      },
      params: t.Object({ id: t.String() }),
      response: t.Object({
        createdAt: t.Date(),
        expiresAt: t.Date(),
        id: t.String(),
      }),
    }
  );
