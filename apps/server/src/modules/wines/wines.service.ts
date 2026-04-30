import type {
  IWinesRepository,
  WineData,
  WineFilters,
  WineWithWinemaker,
} from "./wines.repository";
import { winesRepository } from "./wines.repository";

export class WinesService {
  constructor(private winesRepo: IWinesRepository) {}

  async createWine(userId: string, data: WineData): Promise<WineWithWinemaker> {
    const winemaker = await this.winesRepo.findWinemakerByUserId(userId);
    if (!winemaker) throw new Error("NOT_FOUND");

    const inserted = await this.winesRepo.insert(winemaker.id, data);
    const created = await this.winesRepo.findById(inserted.id);
    if (!created) throw new Error("NOT_FOUND");
    return created;
  }

  async deleteWine(id: string, userId: string, roles: string[]): Promise<void> {
    const wine = await this.winesRepo.findById(id);
    if (!wine) throw new Error("NOT_FOUND");

    if (!roles.includes("admin")) {
      const winemaker = await this.winesRepo.findWinemakerByUserId(userId);
      if (!winemaker || wine.winemakerId !== winemaker.id) throw new Error("FORBIDDEN");
    }

    await this.winesRepo.softDelete(id);
  }

  async getWine(id: string): Promise<WineWithWinemaker> {
    const wine = await this.winesRepo.findById(id);
    if (!wine) throw new Error("NOT_FOUND");
    return wine;
  }

  listWines(filters: WineFilters): Promise<WineWithWinemaker[]> {
    return this.winesRepo.findAll(filters);
  }

  async replaceWine(
    id: string,
    userId: string,
    roles: string[],
    data: WineData
  ): Promise<WineWithWinemaker> {
    const wine = await this.winesRepo.findById(id);
    if (!wine) throw new Error("NOT_FOUND");

    if (!roles.includes("admin")) {
      const winemaker = await this.winesRepo.findWinemakerByUserId(userId);
      if (!winemaker || wine.winemakerId !== winemaker.id) throw new Error("FORBIDDEN");
    }

    await this.winesRepo.updateById(id, data);
    const updated = await this.winesRepo.findById(id);
    if (!updated) throw new Error("NOT_FOUND");
    return updated;
  }
}

export const winesService = new WinesService(winesRepository);
