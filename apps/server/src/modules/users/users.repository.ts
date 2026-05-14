import type { Address, NewAddress, NewUser, User } from "@repo/shared/schemas";
import { addresses, users } from "@repo/shared/schemas";
import { and, eq, isNull } from "drizzle-orm";
import type { Database } from "../../db";

export async function create(db: Database, data: NewUser): Promise<User> {
  const [user] = await db.insert(users).values(data).returning();
  if (!user) throw new Error("Insert returned no rows");
  return user;
}

export async function createAddress(db: Database, data: NewAddress): Promise<Address> {
  const [address] = await db.insert(addresses).values(data).returning();
  if (!address) throw new Error("Insert returned no rows");
  return address;
}

export async function findAddressById(db: Database, id: string): Promise<Address | undefined> {
  return await db.query.addresses.findFirst({
    where: eq(addresses.id, id),
  });
}

export async function findByClerkId(db: Database, clerkId: string): Promise<User | undefined> {
  return await db.query.users.findFirst({
    where: and(eq(users.clerkId, clerkId), isNull(users.deletedAt)),
  });
}

export async function findById(db: Database, id: string): Promise<User | undefined> {
  return await db.query.users.findFirst({
    where: and(eq(users.id, id), isNull(users.deletedAt)),
  });
}

export async function updateById(
  db: Database,
  id: string,
  data: Partial<
    Pick<
      User,
      "fname" | "lname" | "shippingAddressId" | "billingAddressId" | "status" | "deletedAt"
    >
  >
): Promise<User> {
  const [updated] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  if (!updated) throw new Error("User not found");
  return updated;
}

export async function upsert(db: Database, data: NewUser): Promise<User> {
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

  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, data.clerkId),
  });
  if (!existing) throw new Error("User not found after upsert");
  return existing;
}
