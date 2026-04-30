import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Image } from "@repo/shared/schemas";
import type { EntityType, IImagesRepository } from "./images.repository";
import { imagesRepository } from "./images.repository";

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
  constructor(private repo: IImagesRepository) {}

  async listImages(entityType: EntityType, entityId: string): Promise<Image[]> {
    const exists = await this.repo.entityExists(entityType, entityId);
    if (!exists) throw new Error("NOT_FOUND");
    return this.repo.findByEntity(entityType, entityId);
  }

  async uploadImage(caller: Caller, entityType: EntityType, entityId: string, file: File): Promise<Image> {
    if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
      throw new Error("UNSUPPORTED_MEDIA_TYPE");
    }
    if (file.size > MAX_FILE_SIZE) throw new Error("PAYLOAD_TOO_LARGE");

    const exists = await this.repo.entityExists(entityType, entityId);
    if (!exists) throw new Error("NOT_FOUND");

    if (!caller.roles.includes("admin")) {
      await this.verifyOwnership(caller.userId, entityType, entityId);
    }

    const limit = IMAGE_LIMITS[entityType] ?? 10;
    const currentCount = await this.repo.countByEntity(entityType, entityId);
    if (currentCount >= limit) throw new Error("IMAGE_LIMIT_EXCEEDED");

    const mimeToExt: Record<string, string> = {
      "image/gif": "gif",
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const ext = mimeToExt[file.type] ?? "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const dir = join(UPLOADS_DIR, entityType);

    mkdirSync(dir, { recursive: true });
    await Bun.write(join(dir, filename), file);

    return this.repo.insert({ entityId, entityType, url: `/uploads/${entityType}/${filename}` });
  }

  async deleteImage(caller: Caller, entityType: EntityType, entityId: string, imageId: string): Promise<void> {
    const image = await this.repo.findById(imageId);
    if (!image || image.entityType !== entityType || image.entityId !== entityId) {
      throw new Error("NOT_FOUND");
    }

    if (!caller.roles.includes("admin")) {
      await this.verifyOwnership(caller.userId, entityType, entityId);
    }

    await this.repo.softDelete(imageId);
  }

  private async verifyOwnership(userId: string, entityType: EntityType, entityId: string): Promise<void> {
    const ownerUserId = await this.repo.findOwnerUserId(entityType, entityId);
    if (ownerUserId === undefined) throw new Error("NOT_FOUND");
    if (ownerUserId !== userId) throw new Error("FORBIDDEN");
  }
}

export const imagesService = new ImagesService(imagesRepository);
