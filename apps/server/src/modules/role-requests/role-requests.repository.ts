import type { RoleRequest } from "@repo/shared/schemas";
import { roleRequests } from "@repo/shared/schemas";
import { and, eq, isNull } from "drizzle-orm";
<<<<<<< HEAD
import type { Database } from "../../db";

export async function create(
  db: Database,
  data: {
=======
import { db } from "../../db";

export interface IRoleRequestsRepository {
  create(data: {
>>>>>>> origin/main
    userId: string;
    type: "winemaker" | "shop_owner";
    businessName: string;
    details?: string;
<<<<<<< HEAD
  }
): Promise<RoleRequest> {
  const [request] = await db.insert(roleRequests).values(data).returning();
  if (!request) throw new Error("Failed to create role request");
  return request;
}

export async function findById(db: Database, id: string): Promise<RoleRequest | undefined> {
  return db.query.roleRequests.findFirst({
    where: and(eq(roleRequests.id, id), isNull(roleRequests.deletedAt)),
  });
}

export async function findByUserId(db: Database, userId: string): Promise<RoleRequest[]> {
  return db.query.roleRequests.findMany({
    where: and(eq(roleRequests.userId, userId), isNull(roleRequests.deletedAt)),
  });
}

export async function findPending(db: Database): Promise<RoleRequest[]> {
  return db.query.roleRequests.findMany({
    where: and(eq(roleRequests.status, "pending"), isNull(roleRequests.deletedAt)),
  });
}

export async function updateStatus(
  db: Database,
  id: string,
  status: "approved" | "rejected",
  adminUserId: string
): Promise<RoleRequest> {
  const [updated] = await db
    .update(roleRequests)
    .set({ adminUserId, reviewedAt: new Date(), status })
    .where(eq(roleRequests.id, id))
    .returning();
  if (!updated) throw new Error("Role request not found");
  return updated;
}
=======
  }): Promise<RoleRequest>;
  findById(id: string): Promise<RoleRequest | undefined>;
  findByUserId(userId: string): Promise<RoleRequest[]>;
  findPending(): Promise<RoleRequest[]>;
  updateStatus(
    id: string,
    status: "approved" | "rejected",
    adminUserId: string
  ): Promise<RoleRequest>;
}

export const roleRequestsRepository: IRoleRequestsRepository = {
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

  findById(id: string): Promise<RoleRequest | undefined> {
    return db.query.roleRequests.findFirst({
      where: and(eq(roleRequests.id, id), isNull(roleRequests.deletedAt)),
    });
  },

  findByUserId(userId: string): Promise<RoleRequest[]> {
    return db.query.roleRequests.findMany({
      where: and(eq(roleRequests.userId, userId), isNull(roleRequests.deletedAt)),
    });
  },

  async findPending(): Promise<RoleRequest[]> {
    return db.query.roleRequests.findMany({
      where: and(eq(roleRequests.status, "pending"), isNull(roleRequests.deletedAt)),
    });
  },

  async updateStatus(
    id: string,
    status: "approved" | "rejected",
    adminUserId: string
  ): Promise<RoleRequest> {
    const [updated] = await db
      .update(roleRequests)
      .set({ adminUserId, reviewedAt: new Date(), status })
      .where(eq(roleRequests.id, id))
      .returning();
    if (!updated) throw new Error("Role request not found");
    return updated;
  },
};
>>>>>>> origin/main
