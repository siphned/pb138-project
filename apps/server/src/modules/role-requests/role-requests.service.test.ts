import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUpdateUserMetadata } = vi.hoisted(() => ({
  mockUpdateUserMetadata: vi.fn(),
}));

vi.mock("./role-requests.repository", () => ({
  roleRequestsRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findPending: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

vi.mock("../users/users.repository", () => ({
  usersRepository: {
    findById: vi.fn(),
  },
}));

vi.mock("@clerk/backend", () => ({
  createClerkClient: () => ({
    users: {
      updateUserMetadata: mockUpdateUserMetadata,
    },
  }),
}));

import { usersRepository } from "../users/users.repository";
import { roleRequestsRepository } from "./role-requests.repository";
import { roleRequestsService } from "./role-requests.service";

describe("roleRequestsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const userId = "user-123";
  const clerkId = "user_clerk_123";
  const requestId = "req-123";
  const adminId = "admin-123";

  describe("submitRequest", () => {
    it("creates a new request if no pending duplicate exists", async () => {
      vi.mocked(roleRequestsRepository.findByUserId).mockResolvedValue([]);
      vi.mocked(roleRequestsRepository.create).mockResolvedValue({ id: requestId } as never);

      const result = await roleRequestsService.submitRequest(userId, "winemaker", "My Business");

      expect(result.id).toBe(requestId);
      expect(roleRequestsRepository.create).toHaveBeenCalledWith({
        businessName: "My Business",
        details: undefined,
        type: "winemaker",
        userId,
      });
    });

    it("throws ALREADY_HAS_PENDING_REQUEST if a pending request for the same role exists", async () => {
      vi.mocked(roleRequestsRepository.findByUserId).mockResolvedValue([
        { status: "pending", type: "winemaker" },
      ] as never);

      await expect(roleRequestsService.submitRequest(userId, "winemaker", "Other")).rejects.toThrow(
        "ALREADY_HAS_PENDING_REQUEST"
      );
    });
  });

  describe("approve", () => {
    it("updates status to approved and grants role in Clerk", async () => {
      vi.mocked(roleRequestsRepository.findById).mockResolvedValue({
        id: requestId,
        status: "pending",
        type: "winemaker",
        userId,
      } as never);
      vi.mocked(usersRepository.findById).mockResolvedValue({ clerkId } as never);

      await roleRequestsService.approve(requestId, adminId);

      expect(mockUpdateUserMetadata).toHaveBeenCalledWith(clerkId, {
        publicMetadata: { is_winemaker: true },
      });
      expect(roleRequestsRepository.updateStatus).toHaveBeenCalledWith(
        requestId,
        "approved",
        adminId
      );
    });

    it("throws NOT_FOUND if request does not exist", async () => {
      vi.mocked(roleRequestsRepository.findById).mockResolvedValue(undefined);

      await expect(roleRequestsService.approve(requestId, adminId)).rejects.toThrow("NOT_FOUND");
    });

    it("throws ALREADY_RESPONDED if request is not pending", async () => {
      vi.mocked(roleRequestsRepository.findById).mockResolvedValue({
        id: requestId,
        status: "rejected",
      } as never);

      await expect(roleRequestsService.approve(requestId, adminId)).rejects.toThrow(
        "ALREADY_RESPONDED"
      );
    });
  });

  describe("reject", () => {
    it("updates status to rejected", async () => {
      vi.mocked(roleRequestsRepository.findById).mockResolvedValue({
        id: requestId,
        status: "pending",
      } as never);

      await roleRequestsService.reject(requestId, adminId);

      expect(mockUpdateUserMetadata).not.toHaveBeenCalled();
      expect(roleRequestsRepository.updateStatus).toHaveBeenCalledWith(
        requestId,
        "rejected",
        adminId
      );
    });
  });

  describe("listPending", () => {
    it("lists all pending requests", async () => {
      const mockList = [{ id: "r1" }];
      vi.mocked(roleRequestsRepository.findPending).mockResolvedValue(mockList as never);

      const result = await roleRequestsService.listPending();

      expect(result).toBe(mockList);
    });
  });
});
