// apps/server/src/modules/stats/stats.service.ts
import { ForbiddenError, NotFoundError } from "@repo/shared";
import { db } from "../../db";
import * as winemakersRepo from "../winemakers/winemakers.repository";
import * as statsRepo from "./stats.repository";
import { type StatsResponse, statsResponseSchema } from "./stats.schema";

export class StatsService {
  async getStats(userId: string, role: string, callerRoles: string[]): Promise<StatsResponse> {
    if (role !== "customer" && !callerRoles.includes(role)) {
      throw new ForbiddenError("You do not have access to these stats", "FORBIDDEN_STATS");
    }

    let raw: unknown;

    switch (role) {
      case "customer":
        raw = await statsRepo.getCustomerStats(db, userId);
        break;
      case "winemaker": {
        const winemaker = await winemakersRepo.findByUserId(db, userId);
        if (!winemaker)
          throw new NotFoundError("Winemaker profile not found", "WINEMAKER_NOT_FOUND");
        raw = await statsRepo.getWinemakerStats(db, winemaker.id);
        break;
      }
      case "shop_owner":
        raw = await statsRepo.getShopOwnerStats(db, userId);
        break;
      case "admin":
        raw = await statsRepo.getAdminStats(db);
        break;
      default:
        throw new ForbiddenError("Invalid role requested", "INVALID_ROLE");
    }

    return statsResponseSchema.parse(raw);
  }
}

export const statsService = new StatsService();
