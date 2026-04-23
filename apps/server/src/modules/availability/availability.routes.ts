import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { availabilityService } from "./availability.service";
import { addExceptionBody, addRegularBody } from "./availability.schema";

const shopParams = t.Object({ id: t.String() });
const shopEntryParams = t.Object({ id: t.String(), entryId: t.String() });

function handleError(e: unknown) {
  if (e instanceof Error) {
    if (e.message === "NOT_FOUND") return status(404, "Shop not found");
    if (e.message === "FORBIDDEN") return status(403, "Forbidden");
    if (e.message === "INVALID_TIME_RANGE") return status(422, "Invalid time range");
  }
  throw e;
}

export const availabilityRoutes = new Elysia()
  .use(authPlugin)

  .get(
    "/shops/:id/availability",
    async ({ params }) => {
      try {
        return await availabilityService.getAvailability(params.id);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      params: shopParams,
      detail: {
        tags: ["availability"],
        summary: "Get shop availability",
        description: "Returns regular schedule and one-off exceptions for the shop.",
      },
    }
  )

  .post(
    "/shops/:id/availability/regular",
    async ({ params, dbUser, body }) => {
      try {
        return status(201, await availabilityService.addRegular(params.id, dbUser.id, body));
      } catch (e) {
        return handleError(e);
      }
    },
    {
      requireAuth: true,
      params: shopParams,
      body: addRegularBody,
      detail: {
        tags: ["availability"],
        summary: "Add regular schedule entry",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .delete(
    "/shops/:id/availability/regular/:entryId",
    async ({ params, dbUser }) => {
      try {
        await availabilityService.deleteRegular(params.id, params.entryId, dbUser.id);
        return status(204, null);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      requireAuth: true,
      params: shopEntryParams,
      detail: {
        tags: ["availability"],
        summary: "Remove regular schedule entry",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .post(
    "/shops/:id/availability/exceptions",
    async ({ params, dbUser, body }) => {
      try {
        return status(201, await availabilityService.addException(params.id, dbUser.id, body));
      } catch (e) {
        return handleError(e);
      }
    },
    {
      requireAuth: true,
      params: shopParams,
      body: addExceptionBody,
      detail: {
        tags: ["availability"],
        summary: "Add availability exception",
        security: [{ bearerAuth: [] }],
      },
    }
  )

  .delete(
    "/shops/:id/availability/exceptions/:entryId",
    async ({ params, dbUser }) => {
      try {
        await availabilityService.deleteException(params.id, params.entryId, dbUser.id);
        return status(204, null);
      } catch (e) {
        return handleError(e);
      }
    },
    {
      requireAuth: true,
      params: shopEntryParams,
      detail: {
        tags: ["availability"],
        summary: "Remove availability exception",
        security: [{ bearerAuth: [] }],
      },
    }
  );
