import { createClerkClient } from "@clerk/backend";
import type { Address, User } from "../../db/schema";
import type { ClerkPayload } from "../auth/auth.utils";
import { userRolesRepository } from "./user-roles.repository";
import { usersRepository } from "./users.repository";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const usersService = {
  async lazyGetOrCreate(clerkId: string, _payload: ClerkPayload): Promise<User> {
    const existing = await usersRepository.findByClerkId(clerkId);
    if (existing) return existing;

    const clerkUser = await clerkClient.users.getUser(clerkId);

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error("Clerk user has no email address");

    // First login: seed the customer role in Clerk public metadata if not already set
    if (!clerkUser.publicMetadata?.roles) {
      await clerkClient.users.updateUser(clerkId, {
        publicMetadata: { ...clerkUser.publicMetadata, roles: ["customer"] },
      });
    }

    const user = await usersRepository.upsert({
      clerkId,
      fname: clerkUser.firstName ?? "",
      lname: clerkUser.lastName ?? "",
      email,
    });

    // Sync Clerk roles to database
    await this.syncRolesToDatabase(
      user.id,
      (clerkUser.publicMetadata?.roles as string[]) || ["customer"]
    );

    return user;
  },

  async syncRolesToDatabase(userId: string, clerkRoles: string[]): Promise<void> {
    // Get existing roles in DB
    const existingRoles = await userRolesRepository.findByUserId(userId);

    // Add missing roles
    for (const role of clerkRoles) {
      if (!existingRoles.includes(role)) {
        await userRolesRepository.addRole(userId, role);
      }
    }

    // Remove roles that are no longer in Clerk
    for (const role of existingRoles) {
      if (!clerkRoles.includes(role)) {
        await userRolesRepository.removeRole(userId, role);
      }
    }
  },

  getById(id: string): Promise<User | undefined> {
    return usersRepository.findById(id);
  },

  async getProfileWithRoles(
    clerkId: string,
    payload: ClerkPayload
  ): Promise<User & { roles: string[] }> {
    const user = await this.lazyGetOrCreate(clerkId, payload);
    const roles = await userRolesRepository.findByUserId(user.id);
    return { ...user, roles };
  },

  async updateProfile(
    clerkId: string,
    payload: ClerkPayload,
    data: { fname?: string; lname?: string }
  ): Promise<User> {
    const user = await usersService.lazyGetOrCreate(clerkId, payload);
    return usersRepository.updateById(user.id, data);
  },

  async getAddresses(
    clerkId: string,
    payload: ClerkPayload
  ): Promise<{ shipping: Address | null; billing: Address | null }> {
    const user = await usersService.lazyGetOrCreate(clerkId, payload);

    const [shipping, billing] = await Promise.all([
      user.shippingAddressId ? usersRepository.findAddressById(user.shippingAddressId) : null,
      user.billingAddressId ? usersRepository.findAddressById(user.billingAddressId) : null,
    ]);

    return {
      shipping: shipping ?? null,
      billing: billing ?? null,
    };
  },

  async upsertAddress(
    clerkId: string,
    payload: ClerkPayload,
    type: "shipping" | "billing",
    addressData: {
      country: string;
      city: string;
      postalCode: string;
      street: string;
      houseNumber: string;
    }
  ): Promise<Address> {
    const user = await usersService.lazyGetOrCreate(clerkId, payload);

    const address = await usersRepository.createAddress(addressData);

    const field = type === "shipping" ? "shippingAddressId" : "billingAddressId";
    await usersRepository.updateById(user.id, { [field]: address.id });

    return address;
  },

  updateProfileById(userId: string, data: { fname?: string; lname?: string }): Promise<User> {
    return usersRepository.updateById(userId, data);
  },

  async getAddressesForUser(
    user: User
  ): Promise<{ shipping: Address | null; billing: Address | null }> {
    const [shipping, billing] = await Promise.all([
      user.shippingAddressId ? usersRepository.findAddressById(user.shippingAddressId) : null,
      user.billingAddressId ? usersRepository.findAddressById(user.billingAddressId) : null,
    ]);
    return { shipping: shipping ?? null, billing: billing ?? null };
  },

  async upsertAddressForUser(
    userId: string,
    type: "shipping" | "billing",
    addressData: {
      country: string;
      city: string;
      postalCode: string;
      street: string;
      houseNumber: string;
    }
  ): Promise<Address> {
    const address = await usersRepository.createAddress(addressData);
    const field = type === "shipping" ? "shippingAddressId" : "billingAddressId";
    await usersRepository.updateById(userId, { [field]: address.id });
    return address;
  },
};
