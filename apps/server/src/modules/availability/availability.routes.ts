import { Elysia, status, t } from "elysia";
import { authPlugin } from "../auth";
import { addExceptionBody, addRegularBody, getAvailabilityResponse } from "./availability.schema";
import { availabilityService } from "./availability.service";

const shopParams = t.Object({ id: t.String() });
const shopEntryParams = t.Object({ entryId: t.String(), id: t.String() });

export const availabilityRoutes = new Elysia()
  .use(authPlugin)
  .onError(({ error }) => {
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") return new Response("Shop not found", { status: 404 });
      if (error.message === "FORBIDDEN") return new Response("Forbidden", { status: 403 });
      if (error.message === "INVALID_TIME_RANGE")
        return new Response("Invalid time range", { status: 422 });
    }
  })

  .get(
    "/shops/:id/availability",
    async ({ params }) => {
      return await availabilityService.getAvailability(params.id);
    },
    {
      detail: {
        description: "Returns regular schedule and one-off exceptions for the shop.",
        summary: "Get shop availability",
        tags: ["availability"],
      },
      params: shopParams,
      response: getAvailabilityResponse,
    }
  )

  .post(
    "/shops/:id/availability/regular",
    async ({ params, dbUser, body }) => {
      return status(201, await availabilityService.addRegular(params.id, dbUser.id, body));
    },
    {
      body: addRegularBody,
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Add regular schedule entry",
        tags: ["availability"],
      },
      params: shopParams,
      requireRoles: ["shop_owner", "admin"],
    }
  )

  .delete(
    "/shops/:id/availability/regular/:entryId",
    async ({ params, dbUser }) => {
      await availabilityService.deleteRegular(params.id, params.entryId, dbUser.id);
      return status(204, null);
    },
    {
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Remove regular schedule entry",
        tags: ["availability"],
      },
      params: shopEntryParams,
      requireRoles: ["shop_owner", "admin"],
    }
  )

  .post(
    "/shops/:id/availability/exceptions",
    async ({ params, dbUser, body }) => {
      return status(201, await availabilityService.addException(params.id, dbUser.id, body));
    },
    {
      body: addExceptionBody,
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Add availability exception",
        tags: ["availability"],
      },
      params: shopParams,
      requireRoles: ["shop_owner", "admin"],
    }
  )

  .delete(
    "/shops/:id/availability/exceptions/:entryId",
    async ({ params, dbUser }) => {
      await availabilityService.deleteException(params.id, params.entryId, dbUser.id);
      return status(204, null);
    },
    {
      detail: {
        security: [{ bearerAuth: [] }],
        summary: "Remove availability exception",
        tags: ["availability"],
      },
      params: shopEntryParams,
      requireRoles: ["shop_owner", "admin"],
    }
  );
