import { pgTable, uuid } from "drizzle-orm/pg-core";
import { supplyAgreementStatusEnum } from "./enums";
import { timestamptz } from "./helpers";
import { shops, winemakers } from "./sellers";

export const supplyAgreements = pgTable("supply_agreements", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopId: uuid("shop_id")
    .notNull()
    .references(() => shops.id),
  winemakerId: uuid("winemaker_id")
    .notNull()
    .references(() => winemakers.id),
  status: supplyAgreementStatusEnum("status").notNull().default("pending"),
  createdAt: timestamptz("created_at").notNull().defaultNow(),
  respondedAt: timestamptz("responded_at"),
  deletedAt: timestamptz("deleted_at"),
});
