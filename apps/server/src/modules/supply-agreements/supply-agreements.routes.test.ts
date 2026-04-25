import { describe, expect, it, vi } from "vitest";
import { app } from "../../app";

const mockAgreement = {
  id: "a1",
  shopId: "s1",
  winemakerId: "wm1",
  status: "pending",
  createdAt: new Date(),
  respondedAt: null,
};

vi.mock("./supply-agreements.service", () => ({
  supplyAgreementsService: {
    createRequest: vi.fn().mockResolvedValue({
      id: "a1",
      shopId: "s1",
      winemakerId: "wm1",
      status: "pending",
      createdAt: new Date(),
      respondedAt: null,
    }),
    respondToRequest: vi.fn().mockResolvedValue({
      id: "a1",
      shopId: "s1",
      winemakerId: "wm1",
      status: "approved",
      createdAt: new Date(),
      respondedAt: new Date(),
    }),
    listForShop: vi.fn().mockResolvedValue([{
      id: "a1",
      shopId: "s1",
      winemakerId: "wm1",
      status: "pending",
      createdAt: new Date(),
      respondedAt: null,
    }]),
    listForWinemaker: vi.fn().mockResolvedValue([{
      id: "a1",
      shopId: "s1",
      winemakerId: "wm1",
      status: "pending",
      createdAt: new Date(),
      respondedAt: null,
    }]),
  },
}));

vi.mock("../auth/auth.utils", () => ({
  verifyClerkToken: vi.fn().mockResolvedValue({
    sub: "user_1",
    roles: ["shop_owner", "winemaker"],
  }),
}));

vi.mock("../users/users.service", () => ({
  usersService: {
    lazyGetOrCreate: vi.fn().mockResolvedValue({ id: "db_user_1" }),
  },
}));

describe("supply-agreements routes", () => {
  it("POST /supply-agreements creates a request", async () => {
    const response = await app.handle(
      new Request("http://localhost/supply-agreements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
        body: JSON.stringify({
          winemakerId: "wm1",
          shopId: "s1",
        }),
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.id).toBe("a1");
  });

  it("GET /supply-agreements/winemaker lists agreements", async () => {
    const response = await app.handle(
      new Request("http://localhost/supply-agreements/winemaker", {
        method: "GET",
        headers: {
          Authorization: "Bearer token",
        },
      })
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
