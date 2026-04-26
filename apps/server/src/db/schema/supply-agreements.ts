import { pgTable, uuid } from "drizzle-orm/pg-core";
import { supplyAgreementStatusEnum } from "./enums";
import { timestamptz } from "./helpers";
import { shops, winemakers } from "./sellers";

export const supplyAgreements = pgTable("supply_agreements", {
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  deletedAt: timestamptz("deleted_at"),
  id: uuid("id").primaryKey().defaultRandom(),
  respondedAt: timestamptz("responded_at"),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id),
  status: supplyAgreementStatusEnum("status").notNull().default("pending"),
  winemakerId: uuid("winemaker_id")
    .notNull()
    .references(() => winemakers.id),
});
