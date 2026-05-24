import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
<<<<<<< HEAD
=======
import { guestSessionsRepository } from "./guest-sessions.repository";
>>>>>>> origin/main
import { guestSessionsService } from "./guest-sessions.service";

export const guestSessionsRoutes = new Elysia({
  prefix: "/guest-sessions",
  tags: ["guest-sessions"],
})
  .use(authPlugin)
<<<<<<< HEAD

  .post(
    "/",
    async ({ set }) => {
      const session = await guestSessionsService.getOrCreateSession();
      set.status = 201;
=======
  .post(
    "/",
    async ({ cookie: { guest_session_id } }) => {
      const session = await guestSessionsService.getOrCreateSession(
        guest_session_id?.value as string | undefined
      );

      if (guest_session_id) {
        guest_session_id.value = session.id;
        guest_session_id.httpOnly = true;
        guest_session_id.path = "/";
        guest_session_id.expires = session.expiresAt;
      }

>>>>>>> origin/main
      return session;
    },
    {
      detail: {
        description:
<<<<<<< HEAD
          "Creates a new anonymous session record and returns the session ID in the response body. Used for guest carts and temporary state.",
        summary: "Initialize guest session",
=======
          "Returns an existing valid guest session or creates a new one. Sets a guest_session_id cookie.",
        summary: "Get or create a guest session",
>>>>>>> origin/main
      },
      response: t.Object({
        createdAt: t.Date(),
        expiresAt: t.Date(),
        id: t.String(),
      }),
    }
  )
<<<<<<< HEAD

  .get(
    "/:id",
    async ({ params }) => {
      const session = await guestSessionsService.validateSession(params.id);
      if (!session) return status(404, "Session not found or expired");
=======
  .get(
    "/me",
    async ({ cookie: { guest_session_id } }) => {
      const sessionId = guest_session_id?.value;
      if (!sessionId || typeof sessionId !== "string") {
        return status(404, "No guest session found");
      }

      const session = await guestSessionsService.validateSession(sessionId);
      if (!session) {
        return status(404, "Invalid or expired guest session");
      }

>>>>>>> origin/main
      return session;
    },
    {
      detail: {
<<<<<<< HEAD
        description: "Returns metadata for an existing guest session if it has not expired.",
        summary: "Validate guest session",
      },
      params: t.Object({ id: t.String() }),
      response: {
        200: t.Object({ createdAt: t.Date(), expiresAt: t.Date(), id: t.String() }),
        404: t.String(),
      },
    }
=======
        description: "Returns the guest session associated with the guest_session_id cookie.",
        summary: "Get current guest session",
      },
      response: {
        200: t.Object({
          createdAt: t.Date(),
          expiresAt: t.Date(),
          id: t.String(),
        }),
        404: t.String(),
      },
    }
  )
  .delete(
    "/cleanup",
    async () => {
      await guestSessionsRepository.cleanupExpired();
      return status(204, null);
    },
    {
      detail: {
        description:
          "Removes all guest sessions that have passed their expiresAt date. Admin only.",
        security: [{ bearerAuth: [] }],
        summary: "Cleanup expired guest sessions",
      },
      requireRoles: ["admin"],
    }
>>>>>>> origin/main
  );
