import type { Address, NewAddress, NewUser, User } from "@repo/shared/schemas";
import { addresses, users } from "@repo/shared/schemas";
import { eq } from "drizzle-orm";
import { db } from "../../db";

export interface IUsersRepository {
  create(data: NewUser): Promise<User>;
  createAddress(data: NewAddress): Promise<Address>;
  findAddressById(id: string): Promise<Address | undefined>;
  findByClerkId(clerkId: string): Promise<User | undefined>;
  findById(id: string): Promise<User | undefined>;
  updateById(
    id: string,
    data: Partial<Pick<User, "fname" | "lname" | "shippingAddressId" | "billingAddressId">>
  ): Promise<User>;
  upsert(data: NewUser): Promise<User>;
}

export const usersRepository: IUsersRepository = {
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

  async findByClerkId(clerkId: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });
  },

  async findById(id: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
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

  async upsert(data: NewUser): Promise<User> {
    await db
      .insert(users)
      .values(data)
      .onConflictDoUpdate({
        set: {
          email: data.email,
          fname: data.fname,
          lname: data.lname,
          updatedAt: new Date(),
        },
        target: [users.clerkId],
      });

    // Workaround for Drizzle ORM not returning on conflict? Or just safer to re-fetch
    // since we want to avoid the race — fetch what it inserted
    const existing = await db.query.users.findFirst({
      where: eq(users.clerkId, data.clerkId),
    });
    if (!existing) throw new Error("User not found after upsert");
    return existing;
  },
};
