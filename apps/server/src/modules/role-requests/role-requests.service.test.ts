import { beforeEach, describe, expect, it, vi } from "vitest";
<<<<<<< HEAD
import { db } from "../../db";
import * as usersRepo from "../users/users.repository";
import * as roleRequestsRepo from "./role-requests.repository";
import { roleRequestsService } from "./role-requests.service";
=======
>>>>>>> origin/main

const { mockUpdateUserMetadata } = vi.hoisted(() => ({
  mockUpdateUserMetadata: vi.fn(),
}));

<<<<<<< HEAD
vi.mock("./role-requests.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./role-requests.repository")>();
  return {
    ...actual,
=======
vi.mock("./role-requests.repository", () => ({
  roleRequestsRepository: {
>>>>>>> origin/main
    create: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findPending: vi.fn(),
    updateStatus: vi.fn(),
<<<<<<< HEAD
  };
});

vi.mock("../users/users.repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../users/users.repository")>();
  return {
    ...actual,
    findById: vi.fn(),
  };
});
=======
  },
}));

vi.mock("../users/users.repository", () => ({
  usersRepository: {
    findById: vi.fn(),
  },
}));
>>>>>>> origin/main

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

<<<<<<< HEAD
=======
import { usersRepository } from "../users/users.repository";
import { roleRequestsRepository } from "./role-requests.repository";
import { roleRequestsService } from "./role-requests.service";

>>>>>>> origin/main
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
<<<<<<< HEAD
      vi.mocked(roleRequestsRepo.findByUserId).mockResolvedValue([]);
      vi.mocked(roleRequestsRepo.create).mockResolvedValue({ id: requestId } as any);
=======
      vi.mocked(roleRequestsRepository.findByUserId).mockResolvedValue([]);
      vi.mocked(roleRequestsRepository.create).mockResolvedValue({ id: requestId } as never);
>>>>>>> origin/main

      const result = await roleRequestsService.submitRequest(userId, "winemaker", "My Business");

      expect(result.id).toBe(requestId);
<<<<<<< HEAD
      expect(roleRequestsRepo.create).toHaveBeenCalledWith(db, {
=======
      expect(roleRequestsRepository.create).toHaveBeenCalledWith({
>>>>>>> origin/main
        businessName: "My Business",
        details: undefined,
        type: "winemaker",
        userId,
      });
    });

<<<<<<< HEAD
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
=======
    it("throws ALREADY_HAS_PENDING_REQUEST if a pending request for the same role exists", async () => {
      vi.mocked(roleRequestsRepository.findByUserId).mockResolvedValue([
        { status: "pending", type: "winemaker" },
      ] as never);

      await expect(roleRequestsService.submitRequest(userId, "winemaker", "Other")).rejects.toThrow(
        "ALREADY_HAS_PENDING_REQUEST"
      );
>>>>>>> origin/main
    });
  });

  describe("approve", () => {
<<<<<<< HEAD
    it("approves winemaker request and grants role in Clerk", async () => {
      vi.mocked(roleRequestsRepo.findById).mockResolvedValue({
=======
    it("updates status to approved and grants role in Clerk", async () => {
      vi.mocked(roleRequestsRepository.findById).mockResolvedValue({
>>>>>>> origin/main
        id: requestId,
        status: "pending",
        type: "winemaker",
        userId,
<<<<<<< HEAD
      } as any);
      vi.mocked(usersRepo.findById).mockResolvedValue({ clerkId } as any);
=======
      } as never);
      vi.mocked(usersRepository.findById).mockResolvedValue({ clerkId } as never);
>>>>>>> origin/main

      await roleRequestsService.approve(requestId, adminId);

      expect(mockUpdateUserMetadata).toHaveBeenCalledWith(clerkId, {
        publicMetadata: { is_winemaker: true },
      });
<<<<<<< HEAD
      expect(roleRequestsRepo.updateStatus).toHaveBeenCalledWith(
        db,
=======
      expect(roleRequestsRepository.updateStatus).toHaveBeenCalledWith(
>>>>>>> origin/main
        requestId,
        "approved",
        adminId
      );
    });

<<<<<<< HEAD
    it("approves shop_owner request and grants role in Clerk", async () => {
      vi.mocked(roleRequestsRepo.findById).mockResolvedValue({
        id: requestId,
        status: "pending",
        type: "shop_owner",
        userId,
      } as any);
      vi.mocked(usersRepo.findById).mockResolvedValue({ clerkId } as any);

      await roleRequestsService.approve(requestId, adminId);

      expect(mockUpdateUserMetadata).toHaveBeenCalledWith(clerkId, {
        publicMetadata: { is_shop_owner: true },
      });
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
=======
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
>>>>>>> origin/main
    });
  });

  describe("reject", () => {
    it("updates status to rejected", async () => {
<<<<<<< HEAD
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
=======
      vi.mocked(roleRequestsRepository.findById).mockResolvedValue({
        id: requestId,
        status: "pending",
      } as never);

      await roleRequestsService.reject(requestId, adminId);

      expect(mockUpdateUserMetadata).not.toHaveBeenCalled();
      expect(roleRequestsRepository.updateStatus).toHaveBeenCalledWith(
>>>>>>> origin/main
        requestId,
        "rejected",
        adminId
      );
    });
<<<<<<< HEAD

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
=======
  });

  describe("listPending", () => {
    it("lists all pending requests", async () => {
      const mockList = [{ id: "r1" }];
      vi.mocked(roleRequestsRepository.findPending).mockResolvedValue(mockList as never);

      const result = await roleRequestsService.listPending();

      expect(result).toBe(mockList);
>>>>>>> origin/main
    });
  });
});
