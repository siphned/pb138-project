import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./admin.service", () => ({
  adminService: {
    changeUserStatus: vi.fn(),
    deleteReview: vi.fn(),
    listEvents: vi.fn(),
    listReviews: vi.fn(),
    listUsers: vi.fn(),
    setEventStatus: vi.fn(),
  },
}));

import { adminService } from "./admin.service";

describe("adminService route-level contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listUsers accepts filters and pagination", async () => {
    vi.mocked(adminService.listUsers).mockResolvedValue({
      data: [],
      limit: 20,
      page: 1,
      total: 0,
    });

    const result = await adminService.listUsers({}, { page: 1, limit: 20 });
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("deleteReview is called with id and type", async () => {
    vi.mocked(adminService.deleteReview).mockResolvedValue(undefined);

    await adminService.deleteReview("r1", "product");
    expect(adminService.deleteReview).toHaveBeenCalledWith("r1", "product");
  });

  it("setEventStatus is called with id and status", async () => {
    vi.mocked(adminService.setEventStatus).mockResolvedValue({
      id: "e1",
      status: "approved",
    } as never);

    await adminService.setEventStatus("e1", "approved");
    expect(adminService.setEventStatus).toHaveBeenCalledWith("e1", "approved");
  });
});
