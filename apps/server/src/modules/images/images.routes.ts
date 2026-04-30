import { basename } from "node:path";
import { fileURLToPath } from "node:url";
import { Elysia, status, t } from "elysia";
import { handleError } from "../../utils/errors";
import type { AppRole } from "../auth";
import { authPlugin } from "../auth";
import type { EntityType } from "./images.repository";
import { imagesRepository } from "./images.repository";
import { imageResponse, uploadImageBody, VALID_ENTITY_TYPES } from "./images.schema";
import { imagesService } from "./images.service";

const UPLOADS_DIR = fileURLToPath(new URL("../../../uploads", import.meta.url));

function handleUploadError(e: unknown) {
  if (e instanceof Error) {
    if (e.message === "UNSUPPORTED_MEDIA_TYPE") return status(415, "Unsupported file type");
    if (e.message === "PAYLOAD_TOO_LARGE") return status(413, "File too large");
    if (e.message === "IMAGE_LIMIT_EXCEEDED") return status(409, "Image limit reached");
  }
  return handleError(e);
}

function buildImageRoutes(entityPlural: string, entityType: EntityType) {
  const requireRoles: AppRole[] =
    entityType === "shop" || entityType === "product"
      ? ["shop_owner", "admin"]
      : ["winemaker", "admin"];

  return new Elysia()
    .use(authPlugin)

    .get(
      `/${entityPlural}/:id/images`,
      // @ts-ignore - Elysia type inference issue with handleError returns
      async ({ params }) => {
        try {
          return await imagesService.listImages(entityType, params.id);
        } catch (e) {
          return handleError(e);
        }
      },
      {
        detail: {
          description: `List images for a ${entityType}. Public.`,
          summary: `List ${entityType} images`,
          tags: ["images"],
        },
        params: t.Object({ id: t.String() }),
        response: {
          200: t.Array(imageResponse),
          400: t.String(),
          403: t.String(),
          404: t.String(),
        },
      }
    )

    .post(
      `/${entityPlural}/:id/images`,
      async ({ params, body, dbUser, clerkPayload }) => {
        try {
          const image = await imagesService.uploadImage(
            { roles: clerkPayload.roles ?? [], userId: dbUser.id },
            entityType,
            params.id,
            body.file
          );
          return status(201, image);
        } catch (e) {
          return handleUploadError(e);
        }
      },
      {
        body: uploadImageBody,
        detail: {
          description: `Upload an image for a ${entityType}. Requires ownership or admin.`,
          security: [{ bearerAuth: [] }],
          summary: `Upload ${entityType} image`,
          tags: ["images"],
        },
        params: t.Object({ id: t.String() }),
        requireRoles,
        response: {
          201: imageResponse,
          403: t.String(),
          404: t.String(),
          409: t.String(),
          413: t.String(),
          415: t.String(),
        },
      }
    )

    .delete(
      `/${entityPlural}/:id/images/:imageId`,
      async ({ params, dbUser, clerkPayload }) => {
        try {
          await imagesService.deleteImage(
            { roles: clerkPayload.roles ?? [], userId: dbUser.id },
            entityType,
            params.id,
            params.imageId
          );
          return status(204, null);
        } catch (e) {
          return handleError(e);
        }
      },
      {
        detail: {
          description: `Delete an image from a ${entityType}. Requires ownership or admin.`,
          security: [{ bearerAuth: [] }],
          summary: `Delete ${entityType} image`,
          tags: ["images"],
        },
        params: t.Object({ id: t.String(), imageId: t.String() }),
        requireRoles,
        response: { 204: t.Null(), 403: t.String(), 404: t.String() },
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
      const record = await imagesRepository.findByUrl(url);
      if (!record) return status(404, "Not found");
      const file = Bun.file(`${UPLOADS_DIR}/${params.entityType}/${safeName}`);
      if (!(await file.exists())) return status(404, "Not found");
      return file;
    },
    {
      detail: { summary: "Serve uploaded image file", tags: ["images"] },
      params: t.Object({ entityType: t.String(), filename: t.String() }),
    }
  )
  .use(buildImageRoutes("wines", "wine"))
  .use(buildImageRoutes("shops", "shop"))
  .use(buildImageRoutes("products", "product"))
  .use(buildImageRoutes("winemakers", "winemaker"))
  .use(buildImageRoutes("events", "event"));
