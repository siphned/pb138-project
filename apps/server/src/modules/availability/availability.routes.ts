import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { addExceptionBody, addRegularBody, getAvailabilityResponse, regularResponse, exceptionResponse } from "./availability.schema";
import { availabilityService } from "./availability.service";

const shopParams = t.Object({ id: t.String() });
const shopEntryParams = t.Object({ id: t.String(), entryId: t.String() });

export const availabilityRoutes = new Elysia()
  .use(authPlugin)
  .onError(({ error, code }) => {
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") return new Response("Shop not found", { status: 404 });
      if (error.message === "FORBIDDEN") return new Response("Forbidden", { status: 403 });
      if (error.message === "INVALID_TIME_RANGE") return new Response("Invalid time range", { status: 422 });
    }
  })

  .get(
    "/shops/:id/availability",
    async ({ params }) => {
      return await availabilityService.getAvailability(params.id);
    },
    {
      params: shopParams,
      response: getAvailabilityResponse,
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
      return status(201, await availabilityService.addRegular(params.id, dbUser.id, body));
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
      await availabilityService.deleteRegular(params.id, params.entryId, dbUser.id);
      return status(204, null);
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
      return status(201, await availabilityService.addException(params.id, dbUser.id, body));
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
      await availabilityService.deleteException(params.id, params.entryId, dbUser.id);
      return status(204, null);
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
