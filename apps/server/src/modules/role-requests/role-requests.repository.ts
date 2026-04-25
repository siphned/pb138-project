import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db";
import type { RoleRequest } from "../../db/schema";
import { roleRequests } from "../../db/schema";

export const roleRequestsRepository = {
  async findById(id: string): Promise<RoleRequest | undefined> {
    return db.query.roleRequests.findFirst({
      where: and(eq(roleRequests.id, id), isNull(roleRequests.deletedAt)),
    });
  },

  async findByUserId(userId: string): Promise<RoleRequest[]> {
    return db.query.roleRequests.findMany({
      where: and(eq(roleRequests.userId, userId), isNull(roleRequests.deletedAt)),
    });
  },

  async findPending(): Promise<RoleRequest[]> {
    return db.query.roleRequests.findMany({
      where: and(eq(roleRequests.status, "pending"), isNull(roleRequests.deletedAt)),
    });
  },

  async create(data: {
    userId: string;
    type: "winemaker" | "shop_owner";
    businessName: string;
    details?: string;
  }): Promise<RoleRequest> {
    const [request] = await db.insert(roleRequests).values(data).returning();
    if (!request) throw new Error("Failed to create role request");
    return request;
  },

  async updateStatus(
    id: string,
    status: "approved" | "rejected",
    adminUserId: string
  ): Promise<RoleRequest> {
    const [updated] = await db
      .update(roleRequests)
      .set({ status, reviewedAt: new Date(), adminUserId })
      .where(eq(roleRequests.id, id))
      .returning();
    if (!updated) throw new Error("Role request not found");
    return updated;
  },
};
