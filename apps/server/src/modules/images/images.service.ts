import { mkdirSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Image } from "@repo/shared/schemas";
import { db } from "../../db";
import { ForbiddenWineActionError } from "../wines/wines.errors";
import {
  ImageLimitExceededError,
  ImageNotFoundError,
  PayloadTooLargeError,
  UnsupportedMediaTypeError,
} from "./images.errors";
import type { EntityType } from "./images.repository";
import * as imagesRepo from "./images.repository";

const UPLOADS_DIR = fileURLToPath(new URL("../../../uploads", import.meta.url));
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const IMAGE_LIMITS: Record<string, number> = {
  event: 10,
  product: 10,
  shop: 10,
  wine: 10,
  winemaker: 10,
};

type Caller = { roles: string[]; userId: string };

export class ImagesService {
  existsByUrl(url: string): Promise<boolean> {
    return imagesRepo.findByUrl(db, url).then(Boolean);
  }

  async listImages(entityType: EntityType, entityId: string): Promise<Image[]> {
    const exists = await imagesRepo.entityExists(db, entityType, entityId);
    if (!exists) throw new ImageNotFoundError();
    return imagesRepo.findByEntity(db, entityType, entityId);
  }

  async uploadImage(
    caller: Caller,
    entityType: EntityType,
    entityId: string,
    file: File
  ): Promise<Image> {
    if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
      throw new UnsupportedMediaTypeError();
    }
    if (file.size > MAX_FILE_SIZE) throw new PayloadTooLargeError();

    const exists = await imagesRepo.entityExists(db, entityType, entityId);
    if (!exists) throw new ImageNotFoundError();

    if (!caller.roles.includes("admin")) {
      await this.verifyOwnership(caller.userId, entityType, entityId);
    }

    const limit = IMAGE_LIMITS[entityType] ?? 10;
    const currentCount = await imagesRepo.countByEntity(db, entityType, entityId);
    if (currentCount >= limit) throw new ImageLimitExceededError();

    const mimeToExt: Record<string, string> = {
      "image/gif": "gif",
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const ext = mimeToExt[file.type] ?? "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const dir = join(UPLOADS_DIR, entityType);

    const filePath = join(dir, filename);
    mkdirSync(dir, { recursive: true });
    await Bun.write(filePath, file);

    try {
      return await imagesRepo.insert(db, {
        entityId,
        entityType,
        url: `/uploads/${entityType}/${filename}`,
      });
    } catch (e) {
      await unlink(filePath).catch(() => {
        /* Ignore cleanup errors */
      });
      throw e;
    }
  }

  async deleteImage(
    caller: Caller,
    entityType: EntityType,
    entityId: string,
    imageId: string
  ): Promise<void> {
    const image = await imagesRepo.findById(db, imageId);
    if (!image || image.entityType !== entityType || image.entityId !== entityId) {
      throw new ImageNotFoundError();
    }

    if (!caller.roles.includes("admin")) {
      await this.verifyOwnership(caller.userId, entityType, entityId);
    }

    await imagesRepo.softDelete(db, imageId);
  }

  private async verifyOwnership(
    userId: string,
    entityType: EntityType,
    entityId: string
  ): Promise<void> {
    const ownerUserId = await imagesRepo.findOwnerUserId(db, entityType, entityId);
    if (ownerUserId === undefined) throw new ImageNotFoundError();
    if (ownerUserId !== userId) throw new ForbiddenWineActionError();
  }
}

export const imagesService = new ImagesService();
