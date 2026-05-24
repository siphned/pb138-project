import { pgTable, uuid } from "drizzle-orm/pg-core";
<<<<<<< HEAD
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
=======
>>>>>>> origin/main
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
  updatedAt: timestamptz("updated_at"),
  winemakerId: uuid("winemaker_id")
    .notNull()
    .references(() => winemakers.id),
});
<<<<<<< HEAD

export const supplyAgreementSelectSchema = createSelectSchema(supplyAgreements);
export const supplyAgreementInsertSchema = createInsertSchema(supplyAgreements);
export type SupplyAgreementModel = typeof supplyAgreements.$inferSelect;
=======
>>>>>>> origin/main
