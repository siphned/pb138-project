import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";
import * as usersRepo from "../users/users.repository";
import { usersService } from "../users/users.service";
import * as roleRequestsRepo from "./role-requests.repository";
import { roleRequestsService } from "./role-requests.service";

const { mockUpdateUserMetadata, mockGetUser } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
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
      getUser: mockGetUser,
      updateUserMetadata: mockUpdateUserMetadata,
    },
  }),
}));

vi.mock("../users/users.service", () => ({
  usersService: {
    syncRolesToDatabase: vi.fn(),
  },
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
    mockGetUser.mockResolvedValue({ publicMetadata: { roles: ["customer"] } });
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

    it("allows request with optional details", async () => {
      vi.mocked(roleRequestsRepo.findByUserId).mockResolvedValue([]);
      vi.mocked(roleRequestsRepo.create).mockResolvedValue({ id: requestId } as any);

      const result = await roleRequestsService.submitRequest(
        userId,
        "shop_owner",
        "My Shop",
        "Premium wine retailer"
      );

      expect(result.id).toBe(requestId);
      expect(roleRequestsRepo.create).toHaveBeenCalledWith(db, {
        businessName: "My Shop",
        details: "Premium wine retailer",
        type: "shop_owner",
        userId,
      });
    });

    it("throws ALREADY_HAS_PENDING_REQUEST if pending request exists", async () => {
      vi.mocked(roleRequestsRepo.findByUserId).mockResolvedValue([
        { id: "req-1", status: "pending", type: "winemaker", userId } as any,
      ]);

      await expect(
        roleRequestsService.submitRequest(userId, "winemaker", "My Business")
      ).rejects.toMatchObject({ code: "ALREADY_HAS_PENDING_REQUEST" });
    });

    it("allows new request if previous was rejected", async () => {
      vi.mocked(roleRequestsRepo.findByUserId).mockResolvedValue([
        { id: "req-1", status: "rejected", type: "winemaker", userId } as any,
      ]);
      vi.mocked(roleRequestsRepo.create).mockResolvedValue({ id: requestId } as any);

      const result = await roleRequestsService.submitRequest(userId, "winemaker", "My Business");

      expect(result.id).toBe(requestId);
    });

    it("allows new request if previous was approved", async () => {
      vi.mocked(roleRequestsRepo.findByUserId).mockResolvedValue([
        { id: "req-1", status: "approved", type: "winemaker", userId } as any,
      ]);
      vi.mocked(roleRequestsRepo.create).mockResolvedValue({ id: requestId } as any);

      const result = await roleRequestsService.submitRequest(userId, "shop_owner", "My Shop");

      expect(result.id).toBe(requestId);
    });
  });

  describe("approve", () => {
    it("approves winemaker request and grants role in Clerk", async () => {
      vi.mocked(roleRequestsRepo.findById).mockResolvedValue({
        id: requestId,
        status: "pending",
        type: "winemaker",
        userId,
      } as any);
      vi.mocked(usersRepo.findById).mockResolvedValue({ clerkId, id: userId } as any);

      await roleRequestsService.approve(requestId, adminId);

      expect(mockUpdateUserMetadata).toHaveBeenCalledWith(clerkId, {
        publicMetadata: { roles: ["customer", "winemaker"] },
      });
      expect(usersService.syncRolesToDatabase).toHaveBeenCalledWith(userId, [
        "customer",
        "winemaker",
      ]);
      expect(roleRequestsRepo.updateStatus).toHaveBeenCalledWith(
        db,
        requestId,
        "approved",
        adminId
      );
    });

    it("approves shop_owner request and grants role in Clerk", async () => {
      vi.mocked(roleRequestsRepo.findById).mockResolvedValue({
        id: requestId,
        status: "pending",
        type: "shop_owner",
        userId,
      } as any);
      vi.mocked(usersRepo.findById).mockResolvedValue({ clerkId, id: userId } as any);

      await roleRequestsService.approve(requestId, adminId);

      expect(mockUpdateUserMetadata).toHaveBeenCalledWith(clerkId, {
        publicMetadata: { roles: ["customer", "shop_owner"] },
      });
      expect(usersService.syncRolesToDatabase).toHaveBeenCalledWith(userId, [
        "customer",
        "shop_owner",
      ]);
    });

    it("throws ROLE_REQUEST_NOT_FOUND if request doesn't exist", async () => {
      vi.mocked(roleRequestsRepo.findById).mockResolvedValue(undefined);

      await expect(roleRequestsService.approve(requestId, adminId)).rejects.toMatchObject({
        code: "ROLE_REQUEST_NOT_FOUND",
      });
    });

    it("throws ALREADY_RESPONDED if already approved", async () => {
      vi.mocked(roleRequestsRepo.findById).mockResolvedValue({
        id: requestId,
        status: "approved",
        type: "winemaker",
        userId,
      } as any);

      await expect(roleRequestsService.approve(requestId, adminId)).rejects.toMatchObject({
        code: "ALREADY_RESPONDED",
      });
    });

    it("throws ALREADY_RESPONDED if already rejected", async () => {
      vi.mocked(roleRequestsRepo.findById).mockResolvedValue({
        id: requestId,
        status: "rejected",
        type: "winemaker",
        userId,
      } as any);

      await expect(roleRequestsService.approve(requestId, adminId)).rejects.toMatchObject({
        code: "ALREADY_RESPONDED",
      });
    });

    it("throws USER_NOT_FOUND if user doesn't exist", async () => {
      vi.mocked(roleRequestsRepo.findById).mockResolvedValue({
        id: requestId,
        status: "pending",
        type: "winemaker",
        userId,
      } as any);
      vi.mocked(usersRepo.findById).mockResolvedValue(undefined);

      await expect(roleRequestsService.approve(requestId, adminId)).rejects.toMatchObject({
        code: "USER_NOT_FOUND",
      });
    });
  });

  describe("reject", () => {
    it("updates status to rejected", async () => {
      vi.mocked(roleRequestsRepo.findById).mockResolvedValue({
        id: requestId,
        status: "pending",
        userId,
      } as any);
      vi.mocked(usersRepo.findById).mockResolvedValue({
        email: "user@test.com",
        fname: "John",
      } as any);

      await roleRequestsService.reject(requestId, adminId);

      expect(roleRequestsRepo.updateStatus).toHaveBeenCalledWith(
        db,
        requestId,
        "rejected",
        adminId
      );
    });

    it("throws ROLE_REQUEST_NOT_FOUND if request doesn't exist", async () => {
      vi.mocked(roleRequestsRepo.findById).mockResolvedValue(undefined);

      await expect(roleRequestsService.reject(requestId, adminId)).rejects.toMatchObject({
        code: "ROLE_REQUEST_NOT_FOUND",
      });
    });

    it("throws ALREADY_RESPONDED if already approved", async () => {
      vi.mocked(roleRequestsRepo.findById).mockResolvedValue({
        id: requestId,
        status: "approved",
        type: "winemaker",
        userId,
      } as any);

      await expect(roleRequestsService.reject(requestId, adminId)).rejects.toMatchObject({
        code: "ALREADY_RESPONDED",
      });
    });

    it("throws ALREADY_RESPONDED if already rejected", async () => {
      vi.mocked(roleRequestsRepo.findById).mockResolvedValue({
        id: requestId,
        status: "rejected",
        type: "winemaker",
        userId,
      } as any);

      await expect(roleRequestsService.reject(requestId, adminId)).rejects.toMatchObject({
        code: "ALREADY_RESPONDED",
      });
    });
  });

  describe("listPending", () => {
    it("returns all pending requests", async () => {
      const mockRequests = [
        { id: "req-1", status: "pending", type: "winemaker" },
        { id: "req-2", status: "pending", type: "shop_owner" },
      ];
      vi.mocked(roleRequestsRepo.findPending).mockResolvedValue(mockRequests as any);

      const result = await roleRequestsService.listPending();

      expect(result).toEqual(mockRequests);
      expect(roleRequestsRepo.findPending).toHaveBeenCalledWith(db);
    });

    it("returns empty array when no pending requests", async () => {
      vi.mocked(roleRequestsRepo.findPending).mockResolvedValue([]);

      const result = await roleRequestsService.listPending();

      expect(result).toEqual([]);
    });
  });
});
