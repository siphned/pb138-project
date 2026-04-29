import type { Address, NewAddress, NewUser, User } from "@repo/shared/schemas";
import { addresses, users } from "@repo/shared/schemas";
import { eq } from "drizzle-orm";
import { db } from "../../db";

export const usersRepository = {
  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    if (!user) throw new Error("Insert returned no rows");
    return user;
  },

  async createAddress(data: NewAddress): Promise<Address> {
    const [address] = await db.insert(addresses).values(data).returning();
    if (!address) throw new Error("Insert returned no rows");
    return address;
  },

  async findAddressById(id: string): Promise<Address | undefined> {
    return await db.query.addresses.findFirst({
      where: eq(addresses.id, id),
    });
  },
  findByClerkId(clerkId: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });
  },

  findById(id: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },

  async updateById(
    id: string,
    data: Partial<Pick<User, "fname" | "lname" | "shippingAddressId" | "billingAddressId">>
  ): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    if (!updated) throw new Error("User not found");
    return updated;
  },

  // Idempotent insert: if clerk_id already exists (concurrent first-login race),
  // silently skip and return the existing row instead of throwing a unique violation.
  async upsert(data: NewUser): Promise<User> {
    const [inserted] = await db
      .insert(users)
      .values(data)
      .onConflictDoNothing({ target: users.clerkId })
      .returning();

    if (inserted) return inserted;

    // Another concurrent request won the race — fetch what it inserted
    const existing = await db.query.users.findFirst({
      where: eq(users.clerkId, data.clerkId),
    });
    if (!existing) throw new Error("User not found after upsert");
    return existing;
  },
};
