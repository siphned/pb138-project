import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../../db'
import { roleRequests } from '../../db/schema'
import type { RoleRequest } from '../../db/schema'

export const roleRequestsRepository = {
  findById(id: string): Promise<RoleRequest | undefined> {
    return db.query.roleRequests.findFirst({
      where: eq(roleRequests.id, id),
    })
  },

  findPending(): Promise<RoleRequest[]> {
    return db.query.roleRequests.findMany({
      where: eq(roleRequests.status, 'pending'),
    })
  },

  findByUserId(userId: string): Promise<RoleRequest[]> {
    return db.query.roleRequests.findMany({
      where: eq(roleRequests.userId, userId),
    })
  },

  async create(data: {
    userId: string
    requestedRole: 'winemaker' | 'shop_owner'
    businessName: string
    details?: string
  }): Promise<RoleRequest> {
    const [request] = await db
      .insert(roleRequests)
      .values(data)
      .returning()
    return request!
  },

  async updateStatus(
    id: string,
    status: 'approved' | 'rejected',
    reviewedByAdminId: string
  ): Promise<RoleRequest> {
    const [updated] = await db
      .update(roleRequests)
      .set({ status, reviewedAt: new Date(), reviewedByAdminId })
      .where(eq(roleRequests.id, id))
      .returning()
    return updated!
  },
}
