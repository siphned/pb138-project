// apps/server/src/modules/stats/stats.service.ts
import { ForbiddenError } from "@repo/shared";
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
        // Return zeroed stats if the caller has the winemaker role but no
        // profile yet (newly approved role request, no wines created yet).
        raw = winemaker
          ? await statsRepo.getWinemakerStats(db, winemaker.id)
          : {
              avgReviewScore: null,
              eventsByStatus: { approved: 0, pending: 0, rejected: 0 },
              role: "winemaker",
              supplyAgreementsByStatus: { approved: 0, pending: 0, rejected: 0 },
              totalStock: 0,
              wineCount: 0,
            };
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
