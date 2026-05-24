import type { UserRole } from "@repo/shared/schemas";
import { userRoles } from "@repo/shared/schemas";
import { and, eq, inArray, isNull } from "drizzle-orm";
<<<<<<< HEAD
import type { Database } from "../../db";

export async function addRole(db: Database, userId: string, role: string): Promise<UserRole> {
  const [result] = await db
    .insert(userRoles)
    .values({ role, userId })
    .onConflictDoUpdate({
      set: { deletedAt: null },
      target: [userRoles.userId, userRoles.role],
    })
    .returning();
  if (!result) throw new Error("Failed to add role");
  return result;
}

export async function addRoles(db: Database, userId: string, roles: string[]): Promise<void> {
  if (roles.length === 0) return;

  await db
    .insert(userRoles)
    .values(roles.map((role) => ({ role, userId })))
    .onConflictDoUpdate({
      set: { deletedAt: null },
      target: [userRoles.userId, userRoles.role],
    });
}

export async function deleteAllRoles(db: Database, userId: string): Promise<void> {
  await db.update(userRoles).set({ deletedAt: new Date() }).where(eq(userRoles.userId, userId));
}

export async function findByUserId(db: Database, userId: string): Promise<string[]> {
  const roles = await db.query.userRoles.findMany({
    columns: { role: true },
    where: and(eq(userRoles.userId, userId), isNull(userRoles.deletedAt)),
  });
  return roles.map((r) => r.role);
}

export async function hasRole(db: Database, userId: string, role: string): Promise<boolean> {
  const found = await db.query.userRoles.findFirst({
    where: and(eq(userRoles.userId, userId), eq(userRoles.role, role), isNull(userRoles.deletedAt)),
  });
  return !!found;
}

export async function removeRole(db: Database, userId: string, role: string): Promise<void> {
  await db
    .update(userRoles)
    .set({ deletedAt: new Date() })
    .where(and(eq(userRoles.userId, userId), eq(userRoles.role, role)));
}

export async function removeRoles(db: Database, userId: string, roles: string[]): Promise<void> {
  if (roles.length === 0) return;
  await db
    .update(userRoles)
    .set({ deletedAt: new Date() })
    .where(and(eq(userRoles.userId, userId), inArray(userRoles.role, roles)));
}
=======
import { db } from "../../db";

export interface IUserRolesRepository {
  addRole(userId: string, role: string): Promise<UserRole>;
  addRoles(userId: string, roles: string[]): Promise<void>;
  deleteAllRoles(userId: string): Promise<void>;
  findByUserId(userId: string): Promise<string[]>;
  hasRole(userId: string, role: string): Promise<boolean>;
  removeRole(userId: string, role: string): Promise<void>;
  removeRoles(userId: string, roles: string[]): Promise<void>;
}

export const userRolesRepository: IUserRolesRepository = {
  /**
   * Add a role to a user (idempotent - doesn't error if already exists and not deleted)
   */
  async addRole(userId: string, role: string): Promise<UserRole> {
    // Check if already exists and not deleted
    const existing = await db.query.userRoles.findFirst({
      where: and(
        eq(userRoles.userId, userId),
        eq(userRoles.role, role),
        isNull(userRoles.deletedAt)
      ),
    });

    if (existing) return existing;

    const [newRole] = await db.insert(userRoles).values({ role, userId }).returning();
    if (!newRole) throw new Error("Failed to add role");
    return newRole;
  },

  async addRoles(userId: string, roles: string[]): Promise<void> {
    if (roles.length === 0) return;

    await db
      .insert(userRoles)
      .values(roles.map((role) => ({ role, userId })))
      .onConflictDoUpdate({
        set: { deletedAt: null },
        target: [userRoles.userId, userRoles.role],
      });
  },

  async deleteAllRoles(userId: string): Promise<void> {
    await db.update(userRoles).set({ deletedAt: new Date() }).where(eq(userRoles.userId, userId));
  },

  async findByUserId(userId: string): Promise<string[]> {
    const roles = await db.query.userRoles.findMany({
      columns: { role: true },
      where: and(eq(userRoles.userId, userId), isNull(userRoles.deletedAt)),
    });
    return roles.map((r) => r.role);
  },

  async hasRole(userId: string, role: string): Promise<boolean> {
    const found = await db.query.userRoles.findFirst({
      where: and(
        eq(userRoles.userId, userId),
        eq(userRoles.role, role),
        isNull(userRoles.deletedAt)
      ),
    });
    return !!found;
  },

  /**
   * Soft delete a role from a user
   */
  async removeRole(userId: string, role: string): Promise<void> {
    await db
      .update(userRoles)
      .set({ deletedAt: new Date() })
      .where(and(eq(userRoles.userId, userId), eq(userRoles.role, role)));
  },

  async removeRoles(userId: string, roles: string[]): Promise<void> {
    if (roles.length === 0) return;
    await db
      .update(userRoles)
      .set({ deletedAt: new Date() })
      .where(and(eq(userRoles.userId, userId), inArray(userRoles.role, roles)));
  },
};
>>>>>>> origin/main
