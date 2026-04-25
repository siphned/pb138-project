import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { guestSessionsRepository } from "./guest-sessions.repository";
import { guestSessionsService } from "./guest-sessions.service";

export const guestSessionsRoutes = new Elysia({
  prefix: "/guest-sessions",
  tags: ["guest-sessions"],
})
  .use(authPlugin)
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

      return session;
    },
    {
      detail: {
        summary: "Get or create a guest session",
        description:
          "Returns an existing valid guest session or creates a new one. Sets a guest_session_id cookie.",
      },
      response: t.Object({
        id: t.String(),
        createdAt: t.Date(),
        expiresAt: t.Date(),
      }),
    }
  )
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

      return session;
    },
    {
      detail: {
        summary: "Get current guest session",
        description: "Returns the guest session associated with the guest_session_id cookie.",
      },
      response: {
        200: t.Object({
          id: t.String(),
          createdAt: t.Date(),
          expiresAt: t.Date(),
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
      requireRoles: ["admin"],
      detail: {
        summary: "Cleanup expired guest sessions",
        description:
          "Removes all guest sessions that have passed their expiresAt date. Admin only.",
        security: [{ bearerAuth: [] }],
      },
    }
  );
