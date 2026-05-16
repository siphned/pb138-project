import { Elysia, status } from "elysia";
import { authPlugin } from "../auth";
import {
  createCommentBody,
  createEventBody,
  eventParams,
  listEventsQuery,
  paginationQuery,
  updateEventBody,
} from "./events.schema";
import { eventsService } from "./events.service";

export const eventsRoutes = new Elysia()
  .use(authPlugin)

  .get(
    "/events",
    ({ query }) => {
      const { page, limit, ...filters } = query;
      return eventsService.listEvents(filters, { limit, page });
    },
    {
      detail: { summary: "List approved events", tags: ["events"] },
      query: listEventsQuery,
    }
  )

  .get("/events/:id", ({ params }) => eventsService.getEvent(params.id), {
    detail: { summary: "Get event by ID", tags: ["events"] },
    params: eventParams,
  })

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
        summary: "Update own pending event",
        tags: ["events"],
      },
      params: eventParams,
      requireCapability: "winemaker",
    }
  )

  .delete(
    "/events/:id",
    async ({ params, dbUser }) => {
      await eventsService.deleteEvent(params.id, dbUser.id);
      return status(204, null);
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
    async ({ params, dbUser }) => {
      await eventsService.unregisterFromEvent(params.id, dbUser.id);
      return status(204, null);
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
