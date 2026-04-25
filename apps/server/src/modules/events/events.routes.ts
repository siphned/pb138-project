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
  NOT_FOUND: [404, "Not found"],
  FORBIDDEN: [403, "Forbidden"],
  CONFLICT: [409, "Event cannot be edited in its current status"],
  CAPACITY_TOO_LOW: [409, "Capacity cannot be lower than current registration count"],
  ALREADY_REGISTERED: [409, "Already registered for this event"],
  CAPACITY_FULL: [409, "Event is at full capacity"],
  EVENT_NOT_AVAILABLE: [409, "Event is not available for this action"],
  INVALID_DATES: [422, "Invalid dates: start must be in future, end must be after start"],
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
        return await eventsService.listEvents(filters, { page, limit });
      } catch (e) {
        return handleError(e);
      }
    },
    {
      query: listEventsQuery,
      detail: { tags: ["events"], summary: "List approved events" },
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
      params: eventParams,
      detail: { tags: ["events"], summary: "Get event by ID" },
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
      requireCapability: "winemaker",
      body: createEventBody,
      detail: {
        tags: ["events"],
        summary: "Create event (winemaker only)",
        security: [{ bearerAuth: [] }],
      },
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
      requireCapability: "winemaker",
      params: eventParams,
      body: updateEventBody,
      detail: {
        tags: ["events"],
        summary: "Update own pending event",
        security: [{ bearerAuth: [] }],
      },
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
      requireCapability: "winemaker",
      params: eventParams,
      detail: {
        tags: ["events"],
        summary: "Cancel own event (soft delete)",
        security: [{ bearerAuth: [] }],
      },
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
      requireAuth: true,
      params: eventParams,
      detail: {
        tags: ["events"],
        summary: "Register for an event",
        security: [{ bearerAuth: [] }],
      },
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
      requireAuth: true,
      params: eventParams,
      detail: {
        tags: ["events"],
        summary: "Unregister from an event",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .get(
    "/events/:id/comments",
    async ({ params, query }) => {
      try {
        return await eventsService.listComments(params.id, {
          page: query.page,
          limit: query.limit,
        });
      } catch (e) {
        return handleError(e);
      }
    },
    {
      params: eventParams,
      query: paginationQuery,
      detail: { tags: ["events"], summary: "List event comments" },
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
      requireAuth: true,
      params: eventParams,
      body: createCommentBody,
      detail: {
        tags: ["events"],
        summary: "Post a comment on an event",
        security: [{ bearerAuth: [] }],
      },
    }
  );
