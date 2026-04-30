import { mkdirSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./images.repository", () => ({
  imagesRepository: {
    countByEntity: vi.fn(),
    entityExists: vi.fn(),
    findByEntity: vi.fn(),
    findById: vi.fn(),
    findByUrl: vi.fn(),
    findOwnerUserId: vi.fn(),
    insert: vi.fn(),
    softDelete: vi.fn(),
  },
}));

vi.mock("node:fs", () => ({ mkdirSync: vi.fn() }));
vi.mock("node:fs/promises", () => ({ unlink: vi.fn().mockResolvedValue(undefined) }));

import { imagesRepository } from "./images.repository";
import { imagesService } from "./images.service";

const userId = "11111111-1111-1111-1111-111111111111";
const otherUserId = "22222222-2222-2222-2222-222222222222";
const entityId = "33333333-3333-3333-3333-333333333333";
const imageId = "44444444-4444-4444-4444-444444444444";

const mockImage = {
  createdAt: new Date(),
  deletedAt: null,
  entityId,
  entityType: "wine",
  id: imageId,
  updatedAt: null,
  url: "/uploads/wine/uuid.jpg",
};

const makeFile = (type = "image/jpeg") => new File(["content"], "test.jpg", { type });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("Bun", { write: vi.fn().mockResolvedValue(0) });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listImages", () => {
  it("returns images for existing entity", async () => {
    vi.mocked(imagesRepository.entityExists).mockResolvedValue(true);
    vi.mocked(imagesRepository.findByEntity).mockResolvedValue([mockImage] as never);

    const result = await imagesService.listImages("wine", entityId);

    expect(result).toEqual([mockImage]);
    expect(imagesRepository.findByEntity).toHaveBeenCalledWith("wine", entityId);
  });

  it("throws NOT_FOUND when entity does not exist", async () => {
    vi.mocked(imagesRepository.entityExists).mockResolvedValue(false);

    await expect(imagesService.listImages("wine", entityId)).rejects.toThrow("NOT_FOUND");
    expect(imagesRepository.findByEntity).not.toHaveBeenCalled();
  });
});

describe("uploadImage", () => {
  it("uploads image for entity owner", async () => {
    vi.mocked(imagesRepository.entityExists).mockResolvedValue(true);
    vi.mocked(imagesRepository.findOwnerUserId).mockResolvedValue(userId);
    vi.mocked(imagesRepository.countByEntity).mockResolvedValue(0);
    vi.mocked(imagesRepository.insert).mockResolvedValue(mockImage as never);

    await imagesService.uploadImage({ roles: ["winemaker"], userId }, "wine", entityId, makeFile());

    expect(globalThis.Bun.write).toHaveBeenCalled();
    expect(mkdirSync).toHaveBeenCalled();
    expect(imagesRepository.insert).toHaveBeenCalled();
  });

  it("allows admin to upload regardless of ownership", async () => {
    vi.mocked(imagesRepository.entityExists).mockResolvedValue(true);
    vi.mocked(imagesRepository.countByEntity).mockResolvedValue(0);
    vi.mocked(imagesRepository.insert).mockResolvedValue(mockImage as never);

    await imagesService.uploadImage({ roles: ["admin"], userId: otherUserId }, "wine", entityId, makeFile());

    expect(imagesRepository.findOwnerUserId).not.toHaveBeenCalled();
    expect(imagesRepository.insert).toHaveBeenCalled();
  });

  it("throws NOT_FOUND when entity does not exist", async () => {
    vi.mocked(imagesRepository.entityExists).mockResolvedValue(false);

    await expect(
      imagesService.uploadImage({ roles: ["winemaker"], userId }, "wine", entityId, makeFile())
    ).rejects.toThrow("NOT_FOUND");
    expect(globalThis.Bun.write).not.toHaveBeenCalled();
  });

  it("throws FORBIDDEN when caller does not own entity", async () => {
    vi.mocked(imagesRepository.entityExists).mockResolvedValue(true);
    vi.mocked(imagesRepository.findOwnerUserId).mockResolvedValue(otherUserId);

    await expect(
      imagesService.uploadImage({ roles: ["winemaker"], userId }, "wine", entityId, makeFile())
    ).rejects.toThrow("FORBIDDEN");
    expect(globalThis.Bun.write).not.toHaveBeenCalled();
  });

  it("throws NOT_FOUND when entity owner record is soft-deleted", async () => {
    vi.mocked(imagesRepository.entityExists).mockResolvedValue(true);
    vi.mocked(imagesRepository.findOwnerUserId).mockResolvedValue(undefined);

    await expect(
      imagesService.uploadImage({ roles: ["winemaker"], userId }, "wine", entityId, makeFile())
    ).rejects.toThrow("NOT_FOUND");
    expect(globalThis.Bun.write).not.toHaveBeenCalled();
  });

  it("cleans up file from disk when DB insert fails", async () => {
    vi.mocked(imagesRepository.entityExists).mockResolvedValue(true);
    vi.mocked(imagesRepository.findOwnerUserId).mockResolvedValue(userId);
    vi.mocked(imagesRepository.countByEntity).mockResolvedValue(0);
    vi.mocked(imagesRepository.insert).mockRejectedValue(new Error("DB error"));

    await expect(
      imagesService.uploadImage({ roles: ["winemaker"], userId }, "wine", entityId, makeFile())
    ).rejects.toThrow("DB error");
    expect(unlink).toHaveBeenCalled();
  });

  it("throws IMAGE_LIMIT_EXCEEDED when entity already has 10 images", async () => {
    vi.mocked(imagesRepository.entityExists).mockResolvedValue(true);
    vi.mocked(imagesRepository.findOwnerUserId).mockResolvedValue(userId);
    vi.mocked(imagesRepository.countByEntity).mockResolvedValue(10);

    await expect(
      imagesService.uploadImage({ roles: ["winemaker"], userId }, "wine", entityId, makeFile())
    ).rejects.toThrow("IMAGE_LIMIT_EXCEEDED");
    expect(globalThis.Bun.write).not.toHaveBeenCalled();
  });

  it("throws UNSUPPORTED_MEDIA_TYPE for non-image files", async () => {
    await expect(
      imagesService.uploadImage({ roles: ["winemaker"], userId }, "wine", entityId, makeFile("application/pdf"))
    ).rejects.toThrow("UNSUPPORTED_MEDIA_TYPE");
    expect(imagesRepository.entityExists).not.toHaveBeenCalled();
  });

  it("throws PAYLOAD_TOO_LARGE for files over 10MB", async () => {
    const bigFile = { size: 11 * 1024 * 1024, type: "image/jpeg" } as File;

    await expect(
      imagesService.uploadImage({ roles: ["winemaker"], userId }, "wine", entityId, bigFile)
    ).rejects.toThrow("PAYLOAD_TOO_LARGE");
    expect(imagesRepository.entityExists).not.toHaveBeenCalled();
  });
});

describe("deleteImage", () => {
  it("soft-deletes image for entity owner", async () => {
    vi.mocked(imagesRepository.findById).mockResolvedValue(mockImage as never);
    vi.mocked(imagesRepository.findOwnerUserId).mockResolvedValue(userId);

    await imagesService.deleteImage({ roles: ["winemaker"], userId }, "wine", entityId, imageId);

    expect(imagesRepository.softDelete).toHaveBeenCalledWith(imageId);
  });

  it("allows admin to delete any image", async () => {
    vi.mocked(imagesRepository.findById).mockResolvedValue(mockImage as never);

    await imagesService.deleteImage({ roles: ["admin"], userId: otherUserId }, "wine", entityId, imageId);

    expect(imagesRepository.findOwnerUserId).not.toHaveBeenCalled();
    expect(imagesRepository.softDelete).toHaveBeenCalledWith(imageId);
  });

  it("throws NOT_FOUND when image does not exist", async () => {
    vi.mocked(imagesRepository.findById).mockResolvedValue(undefined);

    await expect(
      imagesService.deleteImage({ roles: ["winemaker"], userId }, "wine", entityId, imageId)
    ).rejects.toThrow("NOT_FOUND");
    expect(imagesRepository.softDelete).not.toHaveBeenCalled();
  });

  it("throws NOT_FOUND when image belongs to a different entity", async () => {
    const wrongEntity = { ...mockImage, entityId: "99999999-9999-9999-9999-999999999999" };
    vi.mocked(imagesRepository.findById).mockResolvedValue(wrongEntity as never);

    await expect(
      imagesService.deleteImage({ roles: ["winemaker"], userId }, "wine", entityId, imageId)
    ).rejects.toThrow("NOT_FOUND");
    expect(imagesRepository.softDelete).not.toHaveBeenCalled();
  });

  it("throws FORBIDDEN when caller does not own entity", async () => {
    vi.mocked(imagesRepository.findById).mockResolvedValue(mockImage as never);
    vi.mocked(imagesRepository.findOwnerUserId).mockResolvedValue(otherUserId);

    await expect(
      imagesService.deleteImage({ roles: ["winemaker"], userId }, "wine", entityId, imageId)
    ).rejects.toThrow("FORBIDDEN");
    expect(imagesRepository.softDelete).not.toHaveBeenCalled();
  });
});
