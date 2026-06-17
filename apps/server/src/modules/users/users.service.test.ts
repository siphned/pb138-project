import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "../../db";

const { mockGetUser, mockUpdateUser, mockUpdateUserMetadata } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockUpdateUser: vi.fn().mockResolvedValue({}),
  mockUpdateUserMetadata: vi.fn(),
}));

vi.mock("@clerk/backend", () => ({
  createClerkClient: () => ({
    users: {
      getUser: mockGetUser,
      updateUser: mockUpdateUser,
      updateUserMetadata: mockUpdateUserMetadata,
    },
  }),
}));

vi.mock("./users.repository", () => ({
  create: vi.fn(),
  createAddress: vi.fn(),
  findAddressById: vi.fn(),
  findByClerkId: vi.fn(),
  findById: vi.fn(),
  updateById: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock("./user-roles.repository", () => ({
  addRole: vi.fn().mockResolvedValue(undefined),
  addRoles: vi.fn().mockResolvedValue(undefined),
  findByUserId: vi.fn().mockResolvedValue([]),
  removeRole: vi.fn().mockResolvedValue(undefined),
  removeRoles: vi.fn().mockResolvedValue(undefined),
}));

import * as userRolesRepo from "./user-roles.repository";
import * as usersRepo from "./users.repository";
import { usersService } from "./users.service";

describe("usersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_SECRET_KEY = "test_key";
  });

  const clerkId = "user_123";

  describe("lazyGetOrCreate", () => {
    it("returns the existing user and never calls Clerk when the user is already in the DB", async () => {
      const existingUser = { clerkId, id: "uuid" };
      vi.mocked(usersRepo.findByClerkId).mockResolvedValue(existingUser as never);

      const result = await usersService.lazyGetOrCreate(clerkId);

      expect(result).toBe(existingUser);
      expect(mockGetUser).not.toHaveBeenCalled();
    });

    it("fetches Clerk profile and creates a new user when not found locally", async () => {
      vi.mocked(usersRepo.findByClerkId).mockResolvedValue(undefined);
      mockGetUser.mockResolvedValue({
        emailAddresses: [{ emailAddress: "new@example.com" }],
        firstName: "New",
        lastName: "User",
        publicMetadata: { roles: ["customer"] },
      });
      vi.mocked(usersRepo.upsert).mockResolvedValue({ id: "new-uuid" } as never);

      await usersService.lazyGetOrCreate(clerkId);

      expect(mockGetUser).toHaveBeenCalledWith(clerkId);
      expect(usersRepo.upsert).toHaveBeenCalled();
    });
  });

  describe("syncRolesToDatabase", () => {
    it("batches additions and removals", async () => {
      const userId = "u1";
      vi.mocked(userRolesRepo.findByUserId).mockResolvedValue(["customer", "old-role"]);
      const targetRoles = ["customer", "admin"];

      await usersService.syncRolesToDatabase(userId, targetRoles);

      expect(userRolesRepo.addRoles).toHaveBeenCalledWith(db, userId, ["admin"]);
      expect(userRolesRepo.removeRoles).toHaveBeenCalledWith(db, userId, ["old-role"]);
    });
  });

  describe("upsertAddress", () => {
    it("creates a new address and links it to user", async () => {
      const createdAddr = { id: "new-addr" };
      const addrData = {
        city: "B",
        country: "CZ",
        houseNumber: "1",
        postalCode: "1",
        street: "S",
      };

      vi.mocked(usersRepo.createAddress).mockResolvedValue(createdAddr as never);
      vi.mocked(usersRepo.updateById).mockResolvedValue({ id: "u1" } as never);

      const result = await usersService.upsertAddress("u1", "shipping", addrData);

      expect(result).toBe(createdAddr);
      expect(usersRepo.createAddress).toHaveBeenCalledWith(db, addrData);
    });
  });

  describe("getById", () => {
    it("returns user for db id", async () => {
      const mockUser = { clerkId, id: "u1" };
      vi.mocked(usersRepo.findById).mockResolvedValue(mockUser as never);
      const result = await usersService.getById("u1");
      expect(result).toEqual(mockUser);
    });
  });
});
