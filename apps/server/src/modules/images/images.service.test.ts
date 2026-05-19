import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as imagesRepo from "./images.repository";
import { imagesService } from "./images.service";

vi.mock("./images.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./images.repository")>();
  return {
    ...actual,
    countByEntity: vi.fn(),
    entityExists: vi.fn(),
    findByEntity: vi.fn(),
    findById: vi.fn(),
    findByUrl: vi.fn(),
    findOwnerUserId: vi.fn(),
    insert: vi.fn(),
    softDelete: vi.fn(),
  };
});

vi.mock("node:fs", () => ({ mkdirSync: vi.fn() }));
vi.mock("node:fs/promises", () => ({ unlink: vi.fn().mockResolvedValue(undefined) }));

const userId = "11111111-1111-1111-1111-111111111111";
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
  // `Bun` is only available in Bun runtime, stub it for vitest (Node.js)
  globalThis.Bun ??= { write: vi.fn().mockResolvedValue(0) } as unknown as typeof Bun;
  vi.spyOn(Bun, "write").mockResolvedValue(0);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("listImages", () => {
  it("returns images for existing entity", async () => {
    vi.mocked(imagesRepo.entityExists).mockResolvedValue(true);
    vi.mocked(imagesRepo.findByEntity).mockResolvedValue([mockImage] as any);

    const result = await imagesService.listImages("wine", entityId);

    expect(result).toEqual([mockImage]);
    expect(imagesRepo.findByEntity).toHaveBeenCalledWith(db, "wine", entityId);
  });
});

describe("uploadImage", () => {
  it("uploads image for entity owner", async () => {
    vi.mocked(imagesRepo.entityExists).mockResolvedValue(true);
    vi.mocked(imagesRepo.findOwnerUserId).mockResolvedValue(userId);
    vi.mocked(imagesRepo.countByEntity).mockResolvedValue(0);
    vi.mocked(imagesRepo.insert).mockResolvedValue(mockImage as any);

    await imagesService.uploadImage({ roles: ["winemaker"], userId }, "wine", entityId, makeFile());

    expect(imagesRepo.insert).toHaveBeenCalled();
  });
});

describe("deleteImage", () => {
  it("soft-deletes image for entity owner", async () => {
    vi.mocked(imagesRepo.findById).mockResolvedValue(mockImage as any);
    vi.mocked(imagesRepo.findOwnerUserId).mockResolvedValue(userId);

    await imagesService.deleteImage({ roles: ["winemaker"], userId }, "wine", entityId, imageId);

    expect(imagesRepo.softDelete).toHaveBeenCalledWith(db, imageId);
  });
});
