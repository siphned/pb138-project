import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ClerkPayload } from "../auth/auth.utils";

const { mockGetUser, mockUpdateUser, mockUpdateUserMetadata } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockUpdateUser: vi.fn(),
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
  usersRepository: {
    findByClerkId: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
    updateById: vi.fn(),
    findById: vi.fn(),
    findAddressById: vi.fn(),
    createAddress: vi.fn(),
  },
}));

vi.mock("./user-roles.repository", () => ({
  userRolesRepository: {
    findByUserId: vi.fn().mockResolvedValue([]),
    addRole: vi.fn().mockResolvedValue(undefined),
    removeRole: vi.fn().mockResolvedValue(undefined),
  },
}));

import { usersRepository } from "./users.repository";
import { usersService } from "./users.service";

describe("usersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const clerkId = "user_123";
  const payload = (roles: string[]) =>
    ({
      sub: clerkId,
      roles,
    }) as unknown as ClerkPayload;

  describe("lazyGetOrCreate", () => {
    it("returns the existing user and never calls Clerk when the user is already in the DB", async () => {
      const existingUser = { id: "uuid", clerkId };
      vi.mocked(usersRepository.findByClerkId).mockResolvedValue(existingUser as never);

      const result = await usersService.lazyGetOrCreate(clerkId, payload(["customer"]));

      expect(result).toBe(existingUser);
      expect(mockGetUser).not.toHaveBeenCalled();
    });

    it("fetches Clerk profile and creates a new user when not found locally", async () => {
      vi.mocked(usersRepository.findByClerkId).mockResolvedValue(undefined);
      mockGetUser.mockResolvedValue({
        firstName: "New",
        lastName: "User",
        emailAddresses: [{ emailAddress: "new@example.com" }],
        publicMetadata: { roles: ["customer"] },
      });
      vi.mocked(usersRepository.upsert).mockResolvedValue({ id: "new-uuid" } as never);

      await usersService.lazyGetOrCreate(clerkId, payload(["customer"]));

      expect(mockGetUser).toHaveBeenCalledWith(clerkId);
      expect(usersRepository.upsert).toHaveBeenCalled();
    });

    it("seeds customer role in Clerk metadata on first login when metadata has no roles", async () => {
      vi.mocked(usersRepository.findByClerkId).mockResolvedValue(undefined);
      mockGetUser.mockResolvedValue({
        firstName: "New",
        lastName: "User",
        emailAddresses: [{ emailAddress: "new@example.com" }],
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
    });
  });

  describe("updateProfile", () => {
    it("updates basic profile fields", async () => {
      const existingUser = { id: "uuid", clerkId };
      const updated = { ...existingUser, lname: "Smith" };
      vi.mocked(usersRepository.findByClerkId).mockResolvedValue(existingUser as never);
      vi.mocked(usersRepository.updateById).mockResolvedValue(updated as never);

      await usersService.updateProfile(clerkId, payload(["customer"]), { lname: "Smith" });

      expect(usersRepository.updateById).toHaveBeenCalledWith("uuid", { lname: "Smith" });
    });
  });

  describe("upsertAddress", () => {
    it("creates a new address and links it to user", async () => {
      const existingUser = { id: "uuid", clerkId };
      const createdAddr = { id: "new-addr" };
      const addrData = {
        country: "CZ",
        city: "B",
        postalCode: "1",
        street: "S",
        houseNumber: "1",
      };

      vi.mocked(usersRepository.findByClerkId).mockResolvedValue(existingUser as never);
      vi.mocked(usersRepository.createAddress).mockResolvedValue(createdAddr as never);
      vi.mocked(usersRepository.updateById).mockResolvedValue(existingUser as never);

      const result = await usersService.upsertAddress(
        clerkId,
        payload(["customer"]),
        "shipping",
        addrData
      );

      expect(result).toBe(createdAddr);
      expect(usersRepository.createAddress).toHaveBeenCalledWith(addrData);
    });
  });
});
