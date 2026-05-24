<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
    return created;
  }

  async deleteWine(id: string, userId: string, roles: string[]): Promise<void> {
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
    return wine;
  }

  listWines(filters: WineFilters): Promise<WineWithWinemaker[]> {
<<<<<<< HEAD
    return winesRepo.findAll(db, filters);
=======
    return this.winesRepo.findAll(filters);
>>>>>>> origin/main
  }

  async replaceWine(
    id: string,
    userId: string,
    roles: string[],
    data: WineData
  ): Promise<WineWithWinemaker> {
<<<<<<< HEAD
    const wine = await winesRepo.findById(db, id);
    if (!wine) throw new WineNotFoundError(id);

    if (!roles.includes("admin")) {
      const winemaker = await winesRepo.findWinemakerByUserId(db, userId);
      if (!winemaker || wine.winemakerId !== winemaker.id) throw new ForbiddenWineActionError();
    }

    await winesRepo.updateById(db, id, data);
    const updated = await winesRepo.findById(db, id);
    if (!updated) throw new WineNotFoundError(id);
=======
    const wine = await this.winesRepo.findById(id);
    if (!wine) throw new Error("NOT_FOUND");

    if (!roles.includes("admin")) {
      const winemaker = await this.winesRepo.findWinemakerByUserId(userId);
      if (!winemaker || wine.winemakerId !== winemaker.id) throw new Error("FORBIDDEN");
    }

    await this.winesRepo.updateById(id, data);
    const updated = await this.winesRepo.findById(id);
    if (!updated) throw new Error("NOT_FOUND");
>>>>>>> origin/main
    return updated;
  }
}

<<<<<<< HEAD
export const winesService = new WinesService();
=======
export const winesService = new WinesService(winesRepository);
>>>>>>> origin/main
