import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { supplyAgreementStatusEnum } from "./enums";
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
  respondedAt: timestamp("responded_at"),
});
