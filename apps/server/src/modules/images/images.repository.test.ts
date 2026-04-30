import { images } from "@repo/shared/schemas";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import { imagesRepository } from "./images.repository";

interface MockChained {
  returning: () => Promise<unknown[]>;
  set: () => MockChained;
  values: () => MockChained;
  where: () => MockChained;
}

vi.mock("../../db", () => {
  const m = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ value: 3 }]),
      }),
    }),
    query: {
      events: { findFirst: vi.fn() },
      images: { findFirst: vi.fn(), findMany: vi.fn() },
      products: { findFirst: vi.fn() },
      shops: { findFirst: vi.fn() },
      winemakers: { findFirst: vi.fn() },
      wines: { findFirst: vi.fn() },
    },
    returning: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  };
  return { db: m };
});

const mockDb = db as unknown as { insert: () => MockChained; update: () => MockChained; returning: () => Promise<unknown[]> };

const imageId = "11111111-1111-1111-1111-111111111111";
const entityId = "22222222-2222-2222-2222-222222222222";
const userId = "33333333-3333-3333-3333-333333333333";

beforeEach(() => vi.clearAllMocks());

describe("insert", () => {
  it("inserts image and returns it", async () => {
    const mockImage = { id: imageId, url: "/uploads/wine/uuid.jpg" };
    vi.mocked(mockDb.returning).mockResolvedValueOnce([mockImage]);

    const result = await imagesRepository.insert({ entityId, entityType: "wine", url: "/uploads/wine/uuid.jpg" });

    expect(result.id).toBe(imageId);
    expect(db.insert).toHaveBeenCalledWith(images);
  });

  it("throws when insert returns no rows", async () => {
    vi.mocked(mockDb.returning).mockResolvedValueOnce([]);

    await expect(
      imagesRepository.insert({ entityId, entityType: "wine", url: "/uploads/wine/uuid.jpg" })
    ).rejects.toThrow("Image insert returned no rows");
  });
});

describe("countByEntity", () => {
  it("returns count of non-deleted images for entity", async () => {
    const result = await imagesRepository.countByEntity("wine", entityId);
    expect(result).toBe(3);
    expect(db.select).toHaveBeenCalled();
  });
});

describe("findByEntity", () => {
  it("queries images by entityType and entityId", async () => {
    vi.mocked(db.query.images.findMany).mockResolvedValue([]);

    await imagesRepository.findByEntity("wine", entityId);

    expect(db.query.images.findMany).toHaveBeenCalled();
  });
});

describe("findById", () => {
  it("returns image when found", async () => {
    vi.mocked(db.query.images.findFirst).mockResolvedValue({ id: imageId } as never);
    expect((await imagesRepository.findById(imageId))?.id).toBe(imageId);
  });

  it("returns undefined when not found", async () => {
    vi.mocked(db.query.images.findFirst).mockResolvedValue(undefined);
    expect(await imagesRepository.findById(imageId)).toBeUndefined();
  });
});

describe("softDelete", () => {
  it("sets deletedAt on the image", async () => {
    await imagesRepository.softDelete(imageId);
    expect(db.update).toHaveBeenCalledWith(images);
  });
});

describe("entityExists", () => {
  it("returns true when shop exists", async () => {
    vi.mocked(db.query.shops.findFirst).mockResolvedValue({ id: entityId } as never);
    expect(await imagesRepository.entityExists("shop", entityId)).toBe(true);
  });

  it("returns false when shop is not found", async () => {
    vi.mocked(db.query.shops.findFirst).mockResolvedValue(undefined);
    expect(await imagesRepository.entityExists("shop", entityId)).toBe(false);
  });

  it("returns true when wine exists", async () => {
    vi.mocked(db.query.wines.findFirst).mockResolvedValue({ id: entityId } as never);
    expect(await imagesRepository.entityExists("wine", entityId)).toBe(true);
  });

  it("returns true when product exists", async () => {
    vi.mocked(db.query.products.findFirst).mockResolvedValue({ id: entityId } as never);
    expect(await imagesRepository.entityExists("product", entityId)).toBe(true);
  });

  it("returns true when winemaker exists", async () => {
    vi.mocked(db.query.winemakers.findFirst).mockResolvedValue({ id: entityId } as never);
    expect(await imagesRepository.entityExists("winemaker", entityId)).toBe(true);
  });

  it("returns true when event exists", async () => {
    vi.mocked(db.query.events.findFirst).mockResolvedValue({ id: entityId } as never);
    expect(await imagesRepository.entityExists("event", entityId)).toBe(true);
  });
});

describe("findOwnerUserId", () => {
  it("returns ownerUserId for shop", async () => {
    vi.mocked(db.query.shops.findFirst).mockResolvedValue({ ownerUserId: userId } as never);
    expect(await imagesRepository.findOwnerUserId("shop", entityId)).toBe(userId);
  });

  it("returns userId for winemaker", async () => {
    vi.mocked(db.query.winemakers.findFirst).mockResolvedValue({ userId } as never);
    expect(await imagesRepository.findOwnerUserId("winemaker", entityId)).toBe(userId);
  });

  it("returns winemaker userId for wine", async () => {
    vi.mocked(db.query.wines.findFirst).mockResolvedValue({
      winemaker: { deletedAt: null, userId },
    } as never);
    expect(await imagesRepository.findOwnerUserId("wine", entityId)).toBe(userId);
  });

  it("returns undefined for wine when winemaker is deleted", async () => {
    vi.mocked(db.query.wines.findFirst).mockResolvedValue({
      winemaker: { deletedAt: new Date(), userId },
    } as never);
    expect(await imagesRepository.findOwnerUserId("wine", entityId)).toBeUndefined();
  });

  it("returns shop ownerUserId for product", async () => {
    vi.mocked(db.query.products.findFirst).mockResolvedValue({
      shop: { deletedAt: null, ownerUserId: userId },
    } as never);
    expect(await imagesRepository.findOwnerUserId("product", entityId)).toBe(userId);
  });

  it("returns winemaker userId for event", async () => {
    vi.mocked(db.query.events.findFirst).mockResolvedValue({
      winemaker: { deletedAt: null, userId },
    } as never);
    expect(await imagesRepository.findOwnerUserId("event", entityId)).toBe(userId);
  });
});
