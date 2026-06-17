import { createClerkClient } from "@clerk/backend";
import type { Address, User } from "@repo/shared/schemas";
import z from "zod";
import { db } from "../../db";
import { logger } from "../../utils/logger";
import * as userRolesRepo from "./user-roles.repository";
import { UserNotFoundError } from "./users.errors";
import * as usersRepo from "./users.repository";

// Lazy-load Clerk client to prevent import-time errors if env vars are missing
let _clerkClient: ReturnType<typeof createClerkClient> | null = null;
function getClerkClient() {
  if (!_clerkClient) {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) throw new Error("CLERK_SECRET_KEY is not set");
    _clerkClient = createClerkClient({ secretKey });
  }
  return _clerkClient;
}

const AddressSchema = z.object({
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  houseNumber: z.string().min(1, "House number is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  street: z.string().min(1, "Street is required"),
});

export class UsersService {
  /**
   * Get shipping and billing addresses for a user.
   */
  async getAddresses(
    userId: string
  ): Promise<{ shipping: Address | null; billing: Address | null }> {
    const user = await usersRepo.findById(db, userId);
    if (!user) throw new UserNotFoundError(userId);

    const [shipping, billing] = await Promise.all([
      user.shippingAddressId ? usersRepo.findAddressById(db, user.shippingAddressId) : null,
      user.billingAddressId ? usersRepo.findAddressById(db, user.billingAddressId) : null,
    ]);

    return {
      billing: billing ?? null,
      shipping: shipping ?? null,
    };
  }

  getById(id: string): Promise<User | undefined> {
    return usersRepo.findById(db, id);
  }

  async getUserWithRoles(userId: string): Promise<User & { roles: string[] }> {
    const user = await usersRepo.findById(db, userId);
    if (!user) throw new UserNotFoundError(userId);
    const roles = await userRolesRepo.findByUserId(db, userId);
    return { ...user, roles };
  }

  /**
   * Returns user with their current roles from DB.
   * Lazily syncs with Clerk if user doesn't exist locally.
   */
  async getProfileWithRoles(clerkId: string): Promise<User & { roles: string[] }> {
    const user = await this.lazyGetOrCreate(clerkId);
    const roles = await userRolesRepo.findByUserId(db, user.id);
    return { ...user, roles };
  }

  /**
   * Ensures a local user exists and is synced with Clerk profile/roles.
   * Orchestrates the sync flow with proper separation of concerns.
   */
  async lazyGetOrCreate(clerkId: string): Promise<User> {
    const existing = await usersRepo.findByClerkId(db, clerkId);
    if (existing) return existing;

    const profile = await this.fetchExternalProfile(clerkId);

    const user = await usersRepo.upsert(db, {
      clerkId,
      email: profile.email,
      fname: profile.fname,
      lname: profile.lname,
    });

    await this.syncRolesToDatabase(user.id, profile.roles);

    return user;
  }

  /**
   * Batched role synchronization to prevent N+1 queries.
   */
  async syncRolesToDatabase(userId: string, clerkRoles: string[]): Promise<void> {
    const existingRoles = await userRolesRepo.findByUserId(db, userId);

    const rolesToAdd = clerkRoles.filter((r: string) => !existingRoles.includes(r));
    const rolesToRemove = existingRoles.filter((r: string) => !clerkRoles.includes(r));

    if (rolesToAdd.length === 0 && rolesToRemove.length === 0) return;

    await Promise.all([
      userRolesRepo.addRoles(db, userId, rolesToAdd),
      userRolesRepo.removeRoles(db, userId, rolesToRemove),
    ]);
  }

  /**
   * Proactively syncs user data from Clerk webhooks.
   */
  async syncUserFromWebhook(data: {
    id: string;
    email_addresses?: { email_address: string }[];
    first_name?: string | null;
    last_name?: string | null;
    public_metadata?: Record<string, unknown>;
  }): Promise<void> {
    const { id, email_addresses, first_name, last_name, public_metadata } = data;
    const email = email_addresses?.[0]?.email_address;

    if (!email) {
      logger.warn({ clerkId: id }, "Webhook user has no email, skipping sync");
      return;
    }

    const user = await usersRepo.upsert(db, {
      clerkId: id,
      email,
      fname: first_name ?? "",
      lname: last_name ?? "",
    });

    const roles = (public_metadata?.roles as string[]) || [];
    await this.syncRolesToDatabase(user.id, roles);
  }

  async deleteUserFromWebhook(clerkId: string): Promise<void> {
    const user = await usersRepo.findByClerkId(db, clerkId);
    if (!user) return;
    await usersRepo.updateById(db, user.id, { deletedAt: new Date(), status: "deleted" });
  }

  updateProfileById(userId: string, data: { fname?: string; lname?: string }): Promise<User> {
    return usersRepo.updateById(db, userId, data);
  }

  async upsertAddress(
    userId: string,
    type: "shipping" | "billing",
    addressData: unknown
  ): Promise<Address> {
    const validated = AddressSchema.parse(addressData);
    const address = await usersRepo.createAddress(db, validated);

    const field = type === "shipping" ? "shippingAddressId" : "billingAddressId";
    await usersRepo.updateById(db, userId, { [field]: address.id });

    return address;
  }

  /**
   * Fetches user from Clerk and ensures basic metadata (roles) is seeded.
   */
  private async fetchExternalProfile(clerkId: string): Promise<{
    email: string;
    fname: string;
    lname: string;
    roles: string[];
  }> {
    try {
      const clerk = getClerkClient();
      const clerkUser = await clerk.users.getUser(clerkId);

      const email = clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) throw new Error("Clerk user has no email address");

      const roles = (clerkUser.publicMetadata?.roles as string[]) || [];

      // Proactively seed 'customer' role if metadata is empty
      if (roles.length === 0) {
        const defaultRoles = ["customer"];
        // Fire-and-forget update to Clerk to avoid blocking login
        clerk.users
          .updateUser(clerkId, {
            publicMetadata: { ...clerkUser.publicMetadata, roles: defaultRoles },
          })
          .catch((e) => logger.error({ clerkId }, `Failed to seed Clerk roles: ${e.message}`));
        return {
          email,
          fname: clerkUser.firstName ?? "",
          lname: clerkUser.lastName ?? "",
          roles: defaultRoles,
        };
      }

      return {
        email,
        fname: clerkUser.firstName ?? "",
        lname: clerkUser.lastName ?? "",
        roles,
      };
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(`External profile sync failed for ${clerkId}`);
    }
  }
}

export const usersService = new UsersService();
