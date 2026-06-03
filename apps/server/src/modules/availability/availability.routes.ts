import { Elysia, status } from "elysia";
import { z } from "zod";
import { authPlugin } from "../auth";
import { addExceptionBody, addRegularBody, getAvailabilityResponse } from "./availability.schema";
import { availabilityService } from "./availability.service";

const shopParams = z.object({ id: z.string() });
const shopEntryParams = z.object({ entryId: z.string(), id: z.string() });

export const availabilityRoutes = new Elysia()
  .use(authPlugin)

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
