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

const errorMessages: Record<string, [number, string]> = {
  ALREADY_REGISTERED: [409, "Already registered for this event"],
  CAPACITY_FULL: [409, "Event is at full capacity"],
  CAPACITY_TOO_LOW: [409, "Capacity cannot be lower than current registration count"],
  CONFLICT: [409, "Event cannot be edited in its current status"],
  EVENT_NOT_AVAILABLE: [409, "Event is not available for this action"],
  FORBIDDEN: [403, "Forbidden"],
  INVALID_DATES: [422, "Invalid dates: start must be in future, end must be after start"],
  NOT_FOUND: [404, "Not found"],
};

function handleError(e: unknown) {
  if (e instanceof Error) {
    const errorData = errorMessages[e.message];
    if (errorData) {
      const [code, message] = errorData;
      return status(code, message);
    }
  }
  throw e;
}

export const eventsRoutes = new Elysia()
  .use(authPlugin)

  .get(
    "/events",
    async ({ query }) => {
      try {
        const { page, limit, ...filters } = query;
        return await eventsService.listEvents(filters, { limit, page });
      } catch (e) {
        return handleError(e);
      }
    },
    {
      detail: { summary: "List approved events", tags: ["events"] },
      query: listEventsQuery,
    }
  )

  .get(
    "/events/:id",
    async ({ params }) => {
      try {
        return await eventsService.getEvent(params.id);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      detail: { summary: "Get event by ID", tags: ["events"] },
      params: eventParams,
    }
  )

  .post(
    "/events",
    async ({ body, dbUser }) => {
      try {
        return status(201, await eventsService.createEvent(dbUser.id, body));
      } catch (e) {
        return handleError(e);
      }
    },
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
    async ({ params, body, dbUser }) => {
      try {
        return await eventsService.updateEvent(params.id, dbUser.id, body);
      } catch (e) {
        return handleError(e);
      }
    },
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
      try {
        await eventsService.deleteEvent(params.id, dbUser.id);
        return status(204, null);
      } catch (e) {
        return handleError(e);
      }
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
    async ({ params, dbUser }) => {
      try {
        return status(201, await eventsService.registerForEvent(params.id, dbUser.id));
      } catch (e) {
        return handleError(e);
      }
    },
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
      try {
        await eventsService.unregisterFromEvent(params.id, dbUser.id);
        return status(204, null);
      } catch (e) {
        return handleError(e);
      }
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
    async ({ params, query }) => {
      try {
        return await eventsService.listComments(params.id, {
          limit: query.limit,
          page: query.page,
        });
      } catch (e) {
        return handleError(e);
      }
    },
    {
      detail: { summary: "List event comments", tags: ["events"] },
      params: eventParams,
      query: paginationQuery,
    }
  )

  .post(
    "/events/:id/comments",
    async ({ params, body, dbUser }) => {
      try {
        return status(201, await eventsService.addComment(params.id, dbUser.id, body.body));
      } catch (e) {
        return handleError(e);
      }
    },
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
