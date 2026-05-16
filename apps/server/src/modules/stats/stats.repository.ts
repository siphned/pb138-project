import type { Database } from "../../db";
import type { AdminStats, CustomerStats, ShopOwnerStats, WinemakerStats } from "./stats.schema";

export async function getCustomerStats(_db: Database, _userId: string): Promise<CustomerStats> {
  throw new Error("not implemented");
}

export async function getWinemakerStats(
  _db: Database,
  _winemakerId: string
): Promise<WinemakerStats> {
  throw new Error("not implemented");
}

export async function getShopOwnerStats(
  _db: Database,
  _ownerUserId: string
): Promise<ShopOwnerStats> {
  throw new Error("not implemented");
}

export async function getAdminStats(_db: Database): Promise<AdminStats> {
  throw new Error("not implemented");
}
