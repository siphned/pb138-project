import { beforeEach, describe, expect, it, vi } from "vitest";
<<<<<<< HEAD
import { db } from "../../db";

const { mockGetUser, mockUpdateUser, mockUpdateUserMetadata } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockUpdateUser: vi.fn().mockResolvedValue({}),
=======
import type { ClerkPayload } from "../auth/auth.utils";

const { mockGetUser, mockUpdateUser, mockUpdateUserMetadata } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockUpdateUser: vi.fn(),
>>>>>>> origin/main
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
<<<<<<< HEAD
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
=======
  usersRepository: {
    create: vi.fn(),
    createAddress: vi.fn(),
    findAddressById: vi.fn(),
    findByClerkId: vi.fn(),
    findById: vi.fn(),
    updateById: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock("./user-roles.repository", () => ({
  userRolesRepository: {
    addRole: vi.fn().mockResolvedValue(undefined),
    addRoles: vi.fn().mockResolvedValue(undefined),
    findByUserId: vi.fn().mockResolvedValue([]),
    removeRole: vi.fn().mockResolvedValue(undefined),
    removeRoles: vi.fn().mockResolvedValue(undefined),
  },
}));

import { userRolesRepository } from "./user-roles.repository";
import { usersRepository } from "./users.repository";
>>>>>>> origin/main
import { usersService } from "./users.service";

describe("usersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_SECRET_KEY = "test_key";
  });

  const clerkId = "user_123";
<<<<<<< HEAD
=======
  const payload = (roles: string[]) =>
    ({
      roles,
      sub: clerkId,
    }) as unknown as ClerkPayload;
>>>>>>> origin/main

  describe("lazyGetOrCreate", () => {
    it("returns the existing user and never calls Clerk when the user is already in the DB", async () => {
      const existingUser = { clerkId, id: "uuid" };
<<<<<<< HEAD
      vi.mocked(usersRepo.findByClerkId).mockResolvedValue(existingUser as never);

      const result = await usersService.lazyGetOrCreate(clerkId);
=======
      vi.mocked(usersRepository.findByClerkId).mockResolvedValue(existingUser as never);

      const result = await usersService.lazyGetOrCreate(clerkId, payload(["customer"]));
>>>>>>> origin/main

      expect(result).toBe(existingUser);
      expect(mockGetUser).not.toHaveBeenCalled();
    });

    it("fetches Clerk profile and creates a new user when not found locally", async () => {
<<<<<<< HEAD
      vi.mocked(usersRepo.findByClerkId).mockResolvedValue(undefined);
=======
      vi.mocked(usersRepository.findByClerkId).mockResolvedValue(undefined);
>>>>>>> origin/main
      mockGetUser.mockResolvedValue({
        emailAddresses: [{ emailAddress: "new@example.com" }],
        firstName: "New",
        lastName: "User",
        publicMetadata: { roles: ["customer"] },
      });
<<<<<<< HEAD
      vi.mocked(usersRepo.upsert).mockResolvedValue({ id: "new-uuid" } as never);

      await usersService.lazyGetOrCreate(clerkId);

      expect(mockGetUser).toHaveBeenCalledWith(clerkId);
      expect(usersRepo.upsert).toHaveBeenCalled();
=======
      vi.mocked(usersRepository.upsert).mockResolvedValue({ id: "new-uuid" } as never);

      await usersService.lazyGetOrCreate(clerkId, payload(["customer"]));

      expect(mockGetUser).toHaveBeenCalledWith(clerkId);
      expect(usersRepository.upsert).toHaveBeenCalled();
    });

    it("seeds customer role in Clerk metadata on first login when metadata has no roles", async () => {
      vi.mocked(usersRepository.findByClerkId).mockResolvedValue(undefined);
      mockGetUser.mockResolvedValue({
        emailAddresses: [{ emailAddress: "new@example.com" }],
        firstName: "New",
        lastName: "User",
        publicMetadata: {},
      });
      vi.mocked(usersRepository.upsert).mockResolvedValue({ id: "new-uuid" } as never);

      await usersService.lazyGetOrCreate(clerkId, payload([]));

      expect(mockUpdateUser).toHaveBeenCalledWith(clerkId, {
        publicMetadata: { roles: ["customer"] },
      });
    });

    it("throws when the Clerk user has no email address", async () => {
      vi.mocked(usersRepository.findByClerkId).mockResolvedValue(undefined);
      mockGetUser.mockResolvedValue({
        emailAddresses: [],
      });

      await expect(usersService.lazyGetOrCreate(clerkId, payload([]))).rejects.toThrow(
        "Clerk user has no email address"
      );
>>>>>>> origin/main
    });
  });

  describe("syncRolesToDatabase", () => {
    it("batches additions and removals", async () => {
      const userId = "u1";
<<<<<<< HEAD
      vi.mocked(userRolesRepo.findByUserId).mockResolvedValue(["customer", "old-role"]);
=======
      vi.mocked(userRolesRepository.findByUserId).mockResolvedValue(["customer", "old-role"]);
>>>>>>> origin/main
      const targetRoles = ["customer", "admin"];

      await usersService.syncRolesToDatabase(userId, targetRoles);

<<<<<<< HEAD
      expect(userRolesRepo.addRoles).toHaveBeenCalledWith(db, userId, ["admin"]);
      expect(userRolesRepo.removeRoles).toHaveBeenCalledWith(db, userId, ["old-role"]);
=======
      expect(userRolesRepository.addRoles).toHaveBeenCalledWith(userId, ["admin"]);
      expect(userRolesRepository.removeRoles).toHaveBeenCalledWith(userId, ["old-role"]);
>>>>>>> origin/main
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

<<<<<<< HEAD
      vi.mocked(usersRepo.createAddress).mockResolvedValue(createdAddr as never);
      vi.mocked(usersRepo.updateById).mockResolvedValue({ id: "u1" } as never);
=======
      vi.mocked(usersRepository.createAddress).mockResolvedValue(createdAddr as never);
      vi.mocked(usersRepository.updateById).mockResolvedValue({ id: "u1" } as never);
>>>>>>> origin/main

      const result = await usersService.upsertAddress("u1", "shipping", addrData);

      expect(result).toBe(createdAddr);
<<<<<<< HEAD
      expect(usersRepo.createAddress).toHaveBeenCalledWith(db, addrData);
=======
      expect(usersRepository.createAddress).toHaveBeenCalledWith(addrData);
    });

    it("fails validation for empty fields", async () => {
      const addrData = {
        city: "",
        country: "CZ",
        houseNumber: "1",
        postalCode: "1",
        street: "S",
      };

      await expect(usersService.upsertAddress("u1", "shipping", addrData)).rejects.toThrow();
>>>>>>> origin/main
    });
  });

  describe("getById", () => {
    it("returns user for db id", async () => {
      const mockUser = { clerkId, id: "u1" };
<<<<<<< HEAD
      vi.mocked(usersRepo.findById).mockResolvedValue(mockUser as never);
=======
      vi.mocked(usersRepository.findById).mockResolvedValue(mockUser as never);
>>>>>>> origin/main
      const result = await usersService.getById("u1");
      expect(result).toEqual(mockUser);
    });
  });
});
