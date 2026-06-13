import { Elysia, status } from "elysia";
import { z } from "zod";
import { authPlugin } from "../auth";
import { verifyClerkToken } from "../auth/auth.utils";
import { usersService } from "../users/users.service";
import {
  createCommentBody,
  createEventBody,
  eventParams,
  invitationResponse,
  listEventsQuery,
  paginationQuery,
  updateEventBody,
} from "./events.schema";
import { eventsService } from "./events.service";

export const eventsRoutes = new Elysia()
  .use(authPlugin)
  .derive(async ({ headers }) => {
    const payload = await verifyClerkToken(headers.authorization);
    if (!payload) return { currentUserId: undefined as string | undefined };
    const dbUser = await usersService.lazyGetOrCreate(payload.sub);
    return { currentUserId: dbUser.id as string | undefined };
  })

  .get(
    "/events",
    ({ query, currentUserId }) => {
      const { page, limit, ...filters } = query;
      return eventsService.listEvents(filters, { limit, page }, currentUserId);
    },
    {
      detail: { summary: "List approved events", tags: ["events"] },
      query: listEventsQuery,
    }
  )

  .get(
    "/events/:id",
    ({ params, currentUserId }) => eventsService.getEvent(params.id, currentUserId),
    {
      detail: { summary: "Get event by ID", tags: ["events"] },
      params: eventParams,
    }
  )

  .post(
    "/events",
    async ({ body, dbUser }) => status(201, await eventsService.createEvent(dbUser.id, body)),
    {
      body: createEventBody,
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Create event (winemaker only)",
        tags: ["events"],
      },
      requireCapability: "winemaker",
    }
  )

  .patch(
    "/events/:id",
    ({ params, body, dbUser }) => eventsService.updateEvent(params.id, dbUser.id, body),
    {
      body: updateEventBody,
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Update own upcoming event",
        tags: ["events"],
      },
      params: eventParams,
      requireCapability: "winemaker",
    }
  )

  .delete(
    "/events/:id",
    async ({ params, dbUser, set }) => {
      await eventsService.deleteEvent(params.id, dbUser.id);
      set.status = 204;
    },
    {
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Cancel own event (soft delete)",
        tags: ["events"],
      },
      params: eventParams,
      requireCapability: "winemaker",
    }
  )

  .post(
    "/events/:id/register",
    async ({ params, dbUser }) =>
      status(201, await eventsService.registerForEvent(params.id, dbUser.id)),
    {
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Register for an event",
        tags: ["events"],
      },
      params: eventParams,
      requireAuth: true,
    }
  )

  .delete(
    "/events/:id/register",
    async ({ params, dbUser, set }) => {
      await eventsService.unregisterFromEvent(params.id, dbUser.id);
      set.status = 204;
    },
    {
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Unregister from an event",
        tags: ["events"],
      },
      params: eventParams,
      requireAuth: true,
    }
  )

  .get(
    "/events/:id/comments",
    ({ params, query }) =>
      eventsService.listComments(params.id, { limit: query.limit, page: query.page }),
    {
      detail: { summary: "List event comments", tags: ["events"] },
      params: eventParams,
      query: paginationQuery,
    }
  )

  .get(
    "/events/:id/invitations",
    async ({ params, dbUser }) => {
      try {
        return await eventsService.listInvitations(params.id, dbUser.id);
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.message === "NOT_FOUND") return status(404, "Not found");
          if (e.message === "FORBIDDEN") return status(403, "Forbidden");
        }
        throw e;
      }
    },
    {
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "List invitations for own event",
        tags: ["events"],
      },
      params: eventParams,
      requireCapability: "winemaker",
      response: { 200: z.array(invitationResponse), 403: z.string(), 404: z.string() },
    }
  )

  .post(
    "/events/:id/comments",
    async ({ params, body, dbUser }) =>
      status(201, await eventsService.addComment(params.id, dbUser.id, body.body)),
    {
      body: createCommentBody,
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Post a comment on an event",
        tags: ["events"],
      },
      params: eventParams,
      requireAuth: true,
    }
  );
