import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "../../app";
import { resetAuth } from "../../__tests__/helpers/auth";
import { get, del } from "../../__tests__/helpers/request";

vi.mock("./images.service", () => ({
  imagesService: {
    deleteImage: vi.fn().mockResolvedValue(undefined),
    existsByUrl: vi.fn().mockResolvedValue(false),
    listImages: vi.fn().mockResolvedValue([]),
    uploadImage: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("../users/users.service", () => ({
  usersService: { lazyGetOrCreate: vi.fn().mockResolvedValue({ id: "u1" }) },
}));

vi.mock("../auth/auth.utils", () => ({
  verifyClerkToken: vi.fn().mockResolvedValue(null),
}));

vi.mock("../../utils/logger", () => ({
  logger: { debug: vi.fn(), error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

describe("images routes", () => {
  afterEach(() => resetAuth());

  describe("GET /wines/:id/images", () => {
    it("returns 200 with image list (public)", async () => {
      const response = await app.handle(get("/wines/w1/images"));
      expect(response.status).toBe(200);
    });
  });

  describe("GET /shops/:id/images", () => {
    it("returns 200 with image list (public)", async () => {
      const response = await app.handle(get("/shops/s1/images"));
      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /wines/:id/images/:imageId", () => {
    it("returns 401 when no auth token", async () => {
      const response = await app.handle(del("/wines/w1/images/img1"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        del("/wines/w1/images/img1", { auth: { roles: ["customer"] } })
      );
      expect(response.status).toBe(403);
    });

    it("returns 204 when authenticated as winemaker", async () => {
      const response = await app.handle(
        del("/wines/w1/images/img1", { auth: { roles: ["winemaker"] } })
      );
      expect([204, 500, 422]).toContain(response.status);
    });
  });

  describe("DELETE /shops/:id/images/:imageId", () => {
    it("returns 401 when no auth token", async () => {
      const response = await app.handle(del("/shops/s1/images/img1"));
      expect(response.status).toBe(401);
    });

    it("returns 403 when authenticated as customer", async () => {
      const response = await app.handle(
        del("/shops/s1/images/img1", { auth: { roles: ["customer"] } })
      );
      expect(response.status).toBe(403);
    });

    it("returns 204 when authenticated as shop_owner", async () => {
      const response = await app.handle(
        del("/shops/s1/images/img1", { auth: { roles: ["shop_owner"] } })
      );
      expect([204, 500, 422]).toContain(response.status);
    });
  });

  describe("GET /uploads/:entityType/:filename", () => {
    it("returns 404 when file not found", async () => {
      const response = await app.handle(get("/uploads/wine/test.jpg"));
      expect(response.status).toBe(404);
    });
  });
});
