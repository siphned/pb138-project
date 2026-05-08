import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as usersRepo from "../users/users.repository";
import * as roleRequestsRepo from "./role-requests.repository";
import { roleRequestsService } from "./role-requests.service";

const { mockUpdateUserMetadata } = vi.hoisted(() => ({
  mockUpdateUserMetadata: vi.fn(),
}));

vi.mock("./role-requests.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./role-requests.repository")>();
  return {
    ...actual,
    create: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findPending: vi.fn(),
    updateStatus: vi.fn(),
  };
});

vi.mock("../users/users.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../users/users.repository")>();
  return {
    ...actual,
    findById: vi.fn(),
  };
});

vi.mock("@clerk/backend", () => ({
  createClerkClient: () => ({
    users: {
      updateUserMetadata: mockUpdateUserMetadata,
    },
  }),
}));

vi.mock("../email/email.service", () => ({
  emailService: {
    sendRoleRequestApproved: vi.fn().mockResolvedValue(undefined),
    sendRoleRequestRejected: vi.fn().mockResolvedValue(undefined),
  },
}));

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
      vi.mocked(roleRequestsRepo.findByUserId).mockResolvedValue([]);
      vi.mocked(roleRequestsRepo.create).mockResolvedValue({ id: requestId } as any);

      const result = await roleRequestsService.submitRequest(userId, "winemaker", "My Business");

      expect(result.id).toBe(requestId);
      expect(roleRequestsRepo.create).toHaveBeenCalledWith(db, {
        businessName: "My Business",
        details: undefined,
        type: "winemaker",
        userId,
      });
    });
  });

  describe("approve", () => {
    it("updates status to approved and grants role in Clerk", async () => {
      vi.mocked(roleRequestsRepo.findById).mockResolvedValue({
        id: requestId,
        status: "pending",
        type: "winemaker",
        userId,
      } as any);
      vi.mocked(usersRepo.findById).mockResolvedValue({ clerkId } as any);

      await roleRequestsService.approve(requestId, adminId);

      expect(mockUpdateUserMetadata).toHaveBeenCalledWith(clerkId, {
        publicMetadata: { is_winemaker: true },
      });
      expect(roleRequestsRepo.updateStatus).toHaveBeenCalledWith(
        db,
        requestId,
        "approved",
        adminId
      );
    });
  });

  describe("reject", () => {
    it("updates status to rejected", async () => {
      vi.mocked(roleRequestsRepo.findById).mockResolvedValue({
        id: requestId,
        status: "pending",
      } as any);

      await roleRequestsService.reject(requestId, adminId);

      expect(roleRequestsRepo.updateStatus).toHaveBeenCalledWith(
        db,
        requestId,
        "rejected",
        adminId
      );
    });
  });
});
