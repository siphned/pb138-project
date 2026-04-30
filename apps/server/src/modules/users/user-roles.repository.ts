import type { UserRole } from "@repo/shared/schemas";
import { userRoles } from "@repo/shared/schemas";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db";

export interface IUserRolesRepository {
  addRole(userId: string, role: string): Promise<UserRole>;
  deleteAllRoles(userId: string): Promise<void>;
  findByUserId(userId: string): Promise<string[]>;
  hasRole(userId: string, role: string): Promise<boolean>;
  removeRole(userId: string, role: string): Promise<void>;
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
};
