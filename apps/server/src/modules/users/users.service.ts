import { type User as ClerkUser, createClerkClient } from "@clerk/backend";
import type { Address, User } from "@repo/shared/schemas";
import { z } from "zod";
import type { ClerkPayload } from "../auth/auth.utils";
import { type IUserRolesRepository, userRolesRepository } from "./user-roles.repository";
import { type IUsersRepository, usersRepository } from "./users.repository";

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
  constructor(
    private usersRepo: IUsersRepository,
    private userRolesRepo: IUserRolesRepository
  ) {}

  /**
   * Get shipping and billing addresses for a user.
   */
  async getAddresses(
    userId: string
  ): Promise<{ shipping: Address | null; billing: Address | null }> {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new Error("User not found");

    const [shipping, billing] = await Promise.all([
      user.shippingAddressId ? this.usersRepo.findAddressById(user.shippingAddressId) : null,
      user.billingAddressId ? this.usersRepo.findAddressById(user.billingAddressId) : null,
    ]);

    return {
      billing: billing ?? null,
      shipping: shipping ?? null,
    };
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

  /**
   * Ensures a local user exists and is synced with Clerk metadata.
   */
  async lazyGetOrCreate(clerkId: string, _payload: ClerkPayload): Promise<User> {
    const existing = await this.usersRepo.findByClerkId(clerkId);
    if (existing) return existing;

    const clerk = getClerkClient();
    const clerkUser = await clerk.users.getUser(clerkId);

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error("Clerk user has no email address");

    // 1. Sync Clerk Metadata if needed
    await this.ensureClerkMetadata(clerkId, clerkUser);

    // 2. Create Local User
    const user = await this.usersRepo.upsert({
      clerkId,
      email,
      fname: clerkUser.firstName ?? "",
      lname: clerkUser.lastName ?? "",
    });

    // 3. Sync Roles
    const roles = (clerkUser.publicMetadata?.roles as string[]) || ["customer"];
    await this.syncRolesToDatabase(user.id, roles);

    return user;
  }

  private async ensureClerkMetadata(clerkId: string, clerkUser: ClerkUser): Promise<void> {
    if (!clerkUser.publicMetadata?.roles) {
      const clerk = getClerkClient();
      await clerk.users.updateUser(clerkId, {
        publicMetadata: { ...clerkUser.publicMetadata, roles: ["customer"] },
      });
    }
  }

  /**
   * Batched role synchronization to prevent N+1 queries.
   */
  async syncRolesToDatabase(userId: string, clerkRoles: string[]): Promise<void> {
    const existingRoles = await this.userRolesRepo.findByUserId(userId);

    const rolesToAdd = clerkRoles.filter((r) => !existingRoles.includes(r));
    const rolesToRemove = existingRoles.filter((r) => !clerkRoles.includes(r));

    await Promise.all([
      this.userRolesRepo.addRoles(userId, rolesToAdd),
      this.userRolesRepo.removeRoles(userId, rolesToRemove),
    ]);
  }

  updateProfileById(userId: string, data: { fname?: string; lname?: string }): Promise<User> {
    return this.usersRepo.updateById(userId, data);
  }

  async upsertAddress(
    userId: string,
    type: "shipping" | "billing",
    addressData: unknown
  ): Promise<Address> {
    const validated = AddressSchema.parse(addressData);
    const address = await this.usersRepo.createAddress(validated);

    const field = type === "shipping" ? "shippingAddressId" : "billingAddressId";
    await this.usersRepo.updateById(userId, { [field]: address.id });

    return address;
  }
}

export const usersService = new UsersService(usersRepository, userRolesRepository);
