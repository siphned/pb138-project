import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import type { SupplyAgreement } from "../../db/schema";
import { supplyAgreements } from "../../db/schema";

export const supplyAgreementsRepository = {
  findById(id: string): Promise<SupplyAgreement | undefined> {
    return db.query.supplyAgreements.findFirst({
      where: eq(supplyAgreements.id, id),
    });
  },

  findByShopAndWinemaker(
    shopId: string,
    winemakerId: string
  ): Promise<SupplyAgreement | undefined> {
    return db.query.supplyAgreements.findFirst({
      where: and(
        eq(supplyAgreements.shopId, shopId),
        eq(supplyAgreements.winemakerId, winemakerId)
      ),
    });
  },

  listForShop(shopId: string): Promise<SupplyAgreement[]> {
    return db.select().from(supplyAgreements).where(eq(supplyAgreements.shopId, shopId));
  },

  listForWinemaker(winemakerId: string): Promise<SupplyAgreement[]> {
    return db.select().from(supplyAgreements).where(eq(supplyAgreements.winemakerId, winemakerId));
  },

  async create(data: { shopId: string; winemakerId: string }): Promise<SupplyAgreement> {
    const [agreement] = await db.insert(supplyAgreements).values(data).returning();
    if (!agreement) throw new Error("Failed to create supply agreement");
    return agreement;
  },

  async updateStatus(
    id: string,
    status: "approved" | "rejected"
  ): Promise<SupplyAgreement | undefined> {
    const [agreement] = await db
      .update(supplyAgreements)
      .set({ status, respondedAt: new Date() })
      .where(eq(supplyAgreements.id, id))
      .returning();
    return agreement;
  },
};
