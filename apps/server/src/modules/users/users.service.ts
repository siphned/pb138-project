import { createClerkClient } from "@clerk/backend";
import type { Address, User } from "@repo/shared/schemas";
import type { ClerkPayload } from "../auth/auth.utils";
import { type IUserRolesRepository, userRolesRepository } from "./user-roles.repository";
import { type IUsersRepository, usersRepository } from "./users.repository";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export class UsersService {
  constructor(
    private usersRepo: IUsersRepository,
    private userRolesRepo: IUserRolesRepository
  ) {}

  async getAddresses(
    clerkId: string,
    payload: ClerkPayload
  ): Promise<{ shipping: Address | null; billing: Address | null }> {
    const user = await this.lazyGetOrCreate(clerkId, payload);

    const [shipping, billing] = await Promise.all([
      user.shippingAddressId ? this.usersRepo.findAddressById(user.shippingAddressId) : null,
      user.billingAddressId ? this.usersRepo.findAddressById(user.billingAddressId) : null,
    ]);

    return {
      billing: billing ?? null,
      shipping: shipping ?? null,
    };
  }

  async getAddressesForUser(
    user: User
  ): Promise<{ shipping: Address | null; billing: Address | null }> {
    const [shipping, billing] = await Promise.all([
      user.shippingAddressId ? this.usersRepo.findAddressById(user.shippingAddressId) : null,
      user.billingAddressId ? this.usersRepo.findAddressById(user.billingAddressId) : null,
    ]);
    return { billing: billing ?? null, shipping: shipping ?? null };
  }

  getById(id: string): Promise<User | undefined> {
    return this.usersRepo.findById(id);
  }

  async getProfileWithRoles(
    clerkId: string,
    payload: ClerkPayload
  ): Promise<User & { roles: string[] }> {
    const user = await this.lazyGetOrCreate(clerkId, payload);
    const roles = await this.userRolesRepo.findByUserId(user.id);
    return { ...user, roles };
  }

  async lazyGetOrCreate(clerkId: string, _payload: ClerkPayload): Promise<User> {
    const existing = await this.usersRepo.findByClerkId(clerkId);
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

    const user = await this.usersRepo.upsert({
      clerkId,
      email,
      fname: clerkUser.firstName ?? "",
      lname: clerkUser.lastName ?? "",
    });

    // Sync Clerk roles to database
    await this.syncRolesToDatabase(
      user.id,
      (clerkUser.publicMetadata?.roles as string[]) || ["customer"]
    );

    return user;
  }

  async syncRolesToDatabase(userId: string, clerkRoles: string[]): Promise<void> {
    // Get existing roles in DB
    const existingRoles = await this.userRolesRepo.findByUserId(userId);

    // Add missing roles
    for (const role of clerkRoles) {
      if (!existingRoles.includes(role)) {
        await this.userRolesRepo.addRole(userId, role);
      }
    }

    // Remove roles that are no longer in Clerk
    for (const role of existingRoles) {
      if (!clerkRoles.includes(role)) {
        await this.userRolesRepo.removeRole(userId, role);
      }
    }
  }

  async updateProfile(
    clerkId: string,
    payload: ClerkPayload,
    data: { fname?: string; lname?: string }
  ): Promise<User> {
    const user = await this.lazyGetOrCreate(clerkId, payload);
    return this.usersRepo.updateById(user.id, data);
  }

  updateProfileById(userId: string, data: { fname?: string; lname?: string }): Promise<User> {
    return this.usersRepo.updateById(userId, data);
  }

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
    const user = await this.lazyGetOrCreate(clerkId, payload);

    const address = await this.usersRepo.createAddress(addressData);

    const field = type === "shipping" ? "shippingAddressId" : "billingAddressId";
    await this.usersRepo.updateById(user.id, { [field]: address.id });

    return address;
  }

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
    const address = await this.usersRepo.createAddress(addressData);
    const field = type === "shipping" ? "shippingAddressId" : "billingAddressId";
    await this.usersRepo.updateById(userId, { [field]: address.id });
    return address;
  }
}

export const usersService = new UsersService(usersRepository, userRolesRepository);
