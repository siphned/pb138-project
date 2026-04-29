import type { SupplyAgreement } from "@repo/shared/schemas";
import { supplyAgreements } from "@repo/shared/schemas";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db";

export const supplyAgreementsRepository = {
  async create(data: { shopId: string; winemakerId: string }): Promise<SupplyAgreement> {
    const [agreement] = await db.insert(supplyAgreements).values(data).returning();
    if (!agreement) throw new Error("Failed to create supply agreement");
    return agreement;
  },
  findById(id: string): Promise<SupplyAgreement | undefined> {
    return db.query.supplyAgreements.findFirst({
      where: and(eq(supplyAgreements.id, id), isNull(supplyAgreements.deletedAt)),
    });
  },

  findByShopAndWinemaker(
    shopId: string,
    winemakerId: string
  ): Promise<SupplyAgreement | undefined> {
    return db.query.supplyAgreements.findFirst({
      where: and(
        eq(supplyAgreements.shopId, shopId),
        eq(supplyAgreements.winemakerId, winemakerId),
        isNull(supplyAgreements.deletedAt)
      ),
    });
  },

  listForShop(shopId: string): Promise<SupplyAgreement[]> {
    return db
      .select()
      .from(supplyAgreements)
      .where(and(eq(supplyAgreements.shopId, shopId), isNull(supplyAgreements.deletedAt)));
  },

  listForWinemaker(winemakerId: string): Promise<SupplyAgreement[]> {
    return db
      .select()
      .from(supplyAgreements)
      .where(
        and(eq(supplyAgreements.winemakerId, winemakerId), isNull(supplyAgreements.deletedAt))
      );
  },

  async updateStatus(
    id: string,
    status: "approved" | "rejected"
  ): Promise<SupplyAgreement | undefined> {
    const [agreement] = await db
      .update(supplyAgreements)
      .set({ respondedAt: new Date(), status })
      .where(eq(supplyAgreements.id, id))
      .returning();
    return agreement;
  },
};
