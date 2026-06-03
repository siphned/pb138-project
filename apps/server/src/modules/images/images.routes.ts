import { basename } from "node:path";
import { fileURLToPath } from "node:url";
import { Elysia, status } from "elysia";
import { z } from "zod";
import { errorResponse } from "../../utils/error-plugin";
import type { AppRole } from "../auth";
import { authPlugin } from "../auth";
import type { EntityType } from "./images.repository";
import {
  entityTypeSchema,
  imageResponse,
  uploadImageBody,
  VALID_ENTITY_TYPES,
} from "./images.schema";
import { imagesService } from "./images.service";

const UPLOADS_DIR = fileURLToPath(new URL("../../../uploads", import.meta.url));

const idParams = z.object({ id: z.string() });
const imageDeleteParams = z.object({ id: z.string(), imageId: z.string() });

function buildImageRoutes(entityPlural: string, entityType: EntityType) {
  const requireRoles: AppRole[] =
    entityType === "shop" || entityType === "product"
      ? ["shop_owner", "admin"]
      : ["winemaker", "admin"];

  return new Elysia()
    .use(authPlugin)

    .get(
      `/${entityPlural}/:id/images`,
      async ({ params }) => {
        return await imagesService.listImages(entityType, params.id);
      },
      {
        detail: {
          description: `List images for a ${entityType}. Public.`,
          summary: `List ${entityType} images`,
          tags: ["images"],
        },
        params: idParams,
        response: {
          200: z.array(imageResponse),
          404: errorResponse,
        },
      }
    )

    .post(
      `/${entityPlural}/:id/images`,
      async ({ params, body, dbUser, clerkPayload }) => {
        const image = await imagesService.uploadImage(
          { roles: clerkPayload.roles ?? [], userId: dbUser.id },
          entityType,
          params.id,
          body.file
        );
        return status(201, image);
      },
      {
        body: uploadImageBody,
        detail: {
          description: `Upload an image for a ${entityType}. Requires ownership or admin.`,
          security: [{ bearerAuth: [] }],
          summary: `Upload ${entityType} image`,
          tags: ["images"],
        },
        params: idParams,
        requireRoles,
        response: {
          201: imageResponse,
          403: errorResponse,
          404: errorResponse,
          409: errorResponse,
          413: errorResponse,
          415: errorResponse,
        },
      }
    )

    .delete(
      `/${entityPlural}/:id/images/:imageId`,
      async ({ params, dbUser, clerkPayload }) => {
        await imagesService.deleteImage(
          { roles: clerkPayload.roles ?? [], userId: dbUser.id },
          entityType,
          params.id,
          params.imageId
        );
        return status(204, "");
      },
      {
        detail: {
          description: `Delete an image from a ${entityType}. Requires ownership or admin.`,
          security: [{ bearerAuth: [] }],
          summary: `Delete ${entityType} image`,
          tags: ["images"],
        },
        params: imageDeleteParams,
        requireRoles,
        response: { 204: z.null(), 403: errorResponse, 404: errorResponse },
      }
    );
}

export const imagesRoutes = new Elysia()
  .get(
    "/uploads/:entityType/:filename",
    async ({ params }) => {
      if (!(VALID_ENTITY_TYPES as readonly string[]).includes(params.entityType)) {
        return status(404, "Not found");
      }
      const safeName = basename(params.filename);
      const url = `/uploads/${params.entityType}/${safeName}`;
      if (!(await imagesService.existsByUrl(url))) return status(404, "Not found");
      const file = Bun.file(`${UPLOADS_DIR}/${params.entityType}/${safeName}`);
      if (!(await file.exists())) return status(404, "Not found");
      return file;
    },
    {
      detail: { summary: "Serve uploaded image file", tags: ["images"] },
      params: z.object({ entityType: entityTypeSchema, filename: z.string() }),
    }
  )
  .use(buildImageRoutes("wines", "wine"))
  .use(buildImageRoutes("shops", "shop"))
  .use(buildImageRoutes("products", "product"))
  .use(buildImageRoutes("winemakers", "winemaker"))
  .use(buildImageRoutes("events", "event"));
