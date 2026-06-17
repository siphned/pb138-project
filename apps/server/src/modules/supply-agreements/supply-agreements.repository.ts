import type { SupplyAgreement } from "@repo/shared/schemas";
import { supplyAgreements } from "@repo/shared/schemas";
import { and, eq, isNull } from "drizzle-orm";
import type { Database } from "../../db";

export async function create(
  db: Database,
  data: { shopId: string; winemakerId: string }
): Promise<SupplyAgreement> {
  const [agreement] = await db.insert(supplyAgreements).values(data).returning();
  if (!agreement) throw new Error("Failed to create supply agreement");
  return agreement;
}

export async function findById(db: Database, id: string): Promise<SupplyAgreement | undefined> {
  return db.query.supplyAgreements.findFirst({
    where: and(eq(supplyAgreements.id, id), isNull(supplyAgreements.deletedAt)),
  });
}

export async function findByShopAndWinemaker(
  db: Database,
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
}

export async function listForShop(db: Database, shopId: string): Promise<SupplyAgreement[]> {
  return db
    .select()
    .from(supplyAgreements)
    .where(and(eq(supplyAgreements.shopId, shopId), isNull(supplyAgreements.deletedAt)));
}

export async function listApprovedWinemakerIdsForShop(
  db: Database,
  shopId: string
): Promise<string[]> {
  const rows = await db
    .select({ winemakerId: supplyAgreements.winemakerId })
    .from(supplyAgreements)
    .where(
      and(
        eq(supplyAgreements.shopId, shopId),
        eq(supplyAgreements.status, "approved"),
        isNull(supplyAgreements.deletedAt)
      )
    );
  return rows.map((r) => r.winemakerId);
}

export async function listForWinemaker(
  db: Database,
  winemakerId: string
): Promise<SupplyAgreement[]> {
  return db
    .select()
    .from(supplyAgreements)
    .where(and(eq(supplyAgreements.winemakerId, winemakerId), isNull(supplyAgreements.deletedAt)));
}

export async function updateStatus(
  db: Database,
  id: string,
  status: "approved" | "rejected"
): Promise<SupplyAgreement | undefined> {
  const [agreement] = await db
    .update(supplyAgreements)
    .set({ respondedAt: new Date(), status })
    .where(eq(supplyAgreements.id, id))
    .returning();
  return agreement;
}
