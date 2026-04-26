import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import type { UserRole } from "../../db/schema";
import { userRoles } from "../../db/schema";

export const userRolesRepository = {
  /**
   * Get all roles for a user
   */
  async findByUserId(userId: string): Promise<string[]> {
    const rows = await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.userId, userId));
    return rows.map((r) => r.role);
  },

  /**
   * Add a role to a user (idempotent - doesn't error if already exists)
   */
  async addRole(userId: string, role: string): Promise<UserRole> {
    // Check if already exists
    const existing = await db.query.userRoles.findFirst({
      where: and(eq(userRoles.userId, userId), eq(userRoles.role, role)),
    });

    if (existing) return existing;

    // Add new role
    const [newRole] = await db.insert(userRoles).values({ userId, role }).returning();

    if (!newRole) throw new Error("Failed to add role");
    return newRole;
  },

  /**
   * Remove a role from a user
   */
  async removeRole(userId: string, role: string): Promise<void> {
    await db.delete(userRoles).where(and(eq(userRoles.userId, userId), eq(userRoles.role, role)));
  },

  /**
   * Check if user has a specific role
   */
  async hasRole(userId: string, role: string): Promise<boolean> {
    const result = await db.query.userRoles.findFirst({
      where: and(eq(userRoles.userId, userId), eq(userRoles.role, role)),
    });
    return !!result;
  },

  /**
   * Delete all roles for a user (e.g., when user is deleted)
   */
  async deleteAllRoles(userId: string): Promise<void> {
    await db.delete(userRoles).where(eq(userRoles.userId, userId));
  },
};
