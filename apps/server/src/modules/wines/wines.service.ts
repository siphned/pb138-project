import type { WineData, WineFilters, WineWithWinemaker } from "./wines.repository";
import { winesRepository } from "./wines.repository";

export const winesService = {
  async createWine(userId: string, data: WineData): Promise<WineWithWinemaker> {
    const winemaker = await winesRepository.findWinemakerByUserId(userId);
    if (!winemaker) throw new Error("NOT_FOUND");

    const inserted = await winesRepository.insert(winemaker.id, data);
    const created = await winesRepository.findById(inserted.id);
    if (!created) throw new Error("NOT_FOUND");
    return created;
  },

  async deleteWine(id: string, userId: string, roles: string[]): Promise<void> {
    const wine = await winesRepository.findById(id);
    if (!wine) throw new Error("NOT_FOUND");

    if (!roles.includes("admin")) {
      const winemaker = await winesRepository.findWinemakerByUserId(userId);
      if (!winemaker || wine.winemakerId !== winemaker.id) throw new Error("FORBIDDEN");
    }

    await winesRepository.softDelete(id);
  },

  async getWine(id: string): Promise<WineWithWinemaker> {
    const wine = await winesRepository.findById(id);
    if (!wine) throw new Error("NOT_FOUND");
    return wine;
  },
  listWines(filters: WineFilters): Promise<WineWithWinemaker[]> {
    return winesRepository.findAll(filters);
  },

  async replaceWine(
    id: string,
    userId: string,
    roles: string[],
    data: WineData
  ): Promise<WineWithWinemaker> {
    const wine = await winesRepository.findById(id);
    if (!wine) throw new Error("NOT_FOUND");

    if (!roles.includes("admin")) {
      const winemaker = await winesRepository.findWinemakerByUserId(userId);
      if (!winemaker || wine.winemakerId !== winemaker.id) throw new Error("FORBIDDEN");
    }

    await winesRepository.updateById(id, data);
    const updated = await winesRepository.findById(id);
    if (!updated) throw new Error("NOT_FOUND");
    return updated;
  },
};
