import { db } from "../../db";
import {
  ForbiddenWineActionError,
  WinemakerNotFoundError,
  WineNotFoundError,
} from "./wines.errors";
import type { WineData, WineFilters, WineWithWinemaker } from "./wines.repository";
import * as winesRepo from "./wines.repository";

export class WinesService {
  async createWine(userId: string, data: WineData): Promise<WineWithWinemaker> {
    const winemaker = await winesRepo.findWinemakerByUserId(db, userId);
    if (!winemaker) throw new WinemakerNotFoundError();

    const inserted = await winesRepo.insert(db, winemaker.id, data);
    const created = await winesRepo.findById(db, inserted.id);
    if (!created) throw new WineNotFoundError(inserted.id);
    return created;
  }

  async deleteWine(id: string, userId: string, roles: string[]): Promise<void> {
    const wine = await winesRepo.findById(db, id);
    if (!wine) throw new WineNotFoundError(id);

    if (!roles.includes("admin")) {
      const winemaker = await winesRepo.findWinemakerByUserId(db, userId);
      if (!winemaker || wine.winemakerId !== winemaker.id) throw new ForbiddenWineActionError();
    }

    await winesRepo.softDelete(db, id);
  }

  async getWine(id: string): Promise<WineWithWinemaker> {
    const wine = await winesRepo.findById(db, id);
    if (!wine) throw new WineNotFoundError(id);
    return wine;
  }

  listWines(filters: WineFilters): Promise<WineWithWinemaker[]> {
    return winesRepo.findAll(db, filters);
  }

  async replaceWine(
    id: string,
    userId: string,
    roles: string[],
    data: WineData
  ): Promise<WineWithWinemaker> {
    const wine = await winesRepo.findById(db, id);
    if (!wine) throw new WineNotFoundError(id);

    if (!roles.includes("admin")) {
      const winemaker = await winesRepo.findWinemakerByUserId(db, userId);
      if (!winemaker || wine.winemakerId !== winemaker.id) throw new ForbiddenWineActionError();
    }

    await winesRepo.updateById(db, id, data);
    const updated = await winesRepo.findById(db, id);
    if (!updated) throw new WineNotFoundError(id);
    return updated;
  }
}

export const winesService = new WinesService();
