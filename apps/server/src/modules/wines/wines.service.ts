import type { WineData, WineFilters, WineWithWinemaker } from "./wines.repository";
import { winesRepository } from "./wines.repository";

export const winesService = {
  listWines(filters: WineFilters): Promise<WineWithWinemaker[]> {
    return winesRepository.findAll(filters);
  },

  async getWine(id: string): Promise<WineWithWinemaker> {
    const wine = await winesRepository.findById(id);
    if (!wine) throw new Error("NOT_FOUND");
    return wine;
  },

  async createWine(userId: string, data: WineData): Promise<WineWithWinemaker> {
    const winemaker = await winesRepository.findWinemakerByUserId(userId);
    if (!winemaker) throw new Error("NOT_FOUND");

    const inserted = await winesRepository.insert(winemaker.id, data);
    const created = await winesRepository.findById(inserted.id);
    if (!created) throw new Error("NOT_FOUND");
    return created;
  },

  async replaceWine(
    id: string,
    userId: string,
    userRole: string,
    data: WineData
  ): Promise<WineWithWinemaker> {
    const wine = await winesRepository.findById(id);
    if (!wine) throw new Error("NOT_FOUND");

    if (userRole !== "admin") {
      const winemaker = await winesRepository.findWinemakerByUserId(userId);
      if (!winemaker || wine.winemakerId !== winemaker.id) throw new Error("FORBIDDEN");
    }

    await winesRepository.updateById(id, data);
    const updated = await winesRepository.findById(id);
    if (!updated) throw new Error("NOT_FOUND");
    return updated;
  },

  async deleteWine(id: string, userId: string, userRole: string): Promise<void> {
    const wine = await winesRepository.findById(id);
    if (!wine) throw new Error("NOT_FOUND");

    if (userRole !== "admin") {
      const winemaker = await winesRepository.findWinemakerByUserId(userId);
      if (!winemaker || wine.winemakerId !== winemaker.id) throw new Error("FORBIDDEN");
    }

    await winesRepository.softDelete(id);
  },
};
