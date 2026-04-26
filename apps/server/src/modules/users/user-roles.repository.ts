import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db";
import type { UserRole } from "../../db/schema";
import { userRoles } from "../../db/schema";

export const userRolesRepository = {
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

    // Check if it was soft-deleted, if so, reactivate it
    const deleted = await db.query.userRoles.findFirst({
      where: and(eq(userRoles.userId, userId), eq(userRoles.role, role)),
    });

    if (deleted) {
      const [updated] = await db
        .update(userRoles)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(eq(userRoles.id, deleted.id))
        .returning();
      if (!updated) throw new Error("Failed to reactivate role");
      return updated;
    }

    // Add new role
    const [newRole] = await db.insert(userRoles).values({ role, userId }).returning();

    if (!newRole) throw new Error("Failed to add role");
    return newRole;
  },

  /**
   * Soft-delete all roles for a user
   */
  async deleteAllRoles(userId: string): Promise<void> {
    await db.update(userRoles).set({ deletedAt: new Date() }).where(eq(userRoles.userId, userId));
  },
  /**
   * Get all active roles for a user
   */
  async findByUserId(userId: string): Promise<string[]> {
    const rows = await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), isNull(userRoles.deletedAt)));
    return rows.map((r) => r.role);
  },

  /**
   * Check if user has a specific active role
   */
  async hasRole(userId: string, role: string): Promise<boolean> {
    const result = await db.query.userRoles.findFirst({
      where: and(
        eq(userRoles.userId, userId),
        eq(userRoles.role, role),
        isNull(userRoles.deletedAt)
      ),
    });
    return !!result;
  },

  /**
   * Remove (soft-delete) a role from a user
   */
  async removeRole(userId: string, role: string): Promise<void> {
    await db
      .update(userRoles)
      .set({ deletedAt: new Date() })
      .where(and(eq(userRoles.userId, userId), eq(userRoles.role, role)));
  },
};
