import { images } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as imagesRepository from "./images.repository";

vi.mock("../../db", () => {
  const m = {
    insert: vi.fn().mockReturnThis(),
    query: {
      events: { findFirst: vi.fn() },
      images: { findFirst: vi.fn(), findMany: vi.fn() },
      products: { findFirst: vi.fn() },
      shops: { findFirst: vi.fn() },
      winemakers: { findFirst: vi.fn() },
      wines: { findFirst: vi.fn() },
    },
    returning: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ value: 3 }]),
      }),
    }),
    set: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  };
  return { db: m };
});

const mockDb = db as any;

const imageId = "11111111-1111-1111-1111-111111111111";
const entityId = "22222222-2222-2222-2222-222222222222";
const userId = "33333333-3333-3333-3333-333333333333";

beforeEach(() => vi.clearAllMocks());

describe("insert", () => {
  it("inserts image and returns it", async () => {
    const mockImage = { id: imageId, url: "/uploads/wine/uuid.jpg" };
    vi.mocked(mockDb.returning).mockResolvedValueOnce([mockImage]);

    const result = await imagesRepository.insert(db, {
      entityId,
      entityType: "wine",
      url: "/uploads/wine/uuid.jpg",
    });

    expect(result.id).toBe(imageId);
    expect(db.insert).toHaveBeenCalledWith(images);
  });
});

describe("countByEntity", () => {
  it("returns count of non-deleted images for entity", async () => {
    const result = await imagesRepository.countByEntity(db, "wine", entityId);
    expect(result).toBe(3);
  });
});

describe("findById", () => {
  it("returns image when found", async () => {
    vi.mocked(db.query.images.findFirst).mockResolvedValue({ id: imageId } as any);
    expect((await imagesRepository.findById(db, imageId))?.id).toBe(imageId);
  });
});

describe("findByEntity", () => {
  it("queries images ordered by createdAt then id", () => {
    (mockDb.query.images.findMany as any).mockReturnValue(Promise.resolve([]));
    imagesRepository.findByEntity(db as any, "product", entityId);
    const arg = (mockDb.query.images.findMany as any).mock.calls[0][0];
    expect(Array.isArray(arg.orderBy)).toBe(true);
    expect(arg.orderBy).toHaveLength(2);
  });
});

describe("findOwnerUserId", () => {
  it("returns ownerUserId for shop", async () => {
    vi.mocked(db.query.shops.findFirst).mockResolvedValue({ ownerUserId: userId } as any);
    expect(await imagesRepository.findOwnerUserId(db, "shop", entityId)).toBe(userId);
  });
});
