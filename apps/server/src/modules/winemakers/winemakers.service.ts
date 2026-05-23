import type { Wine } from "@repo/shared/schemas";
import { db } from "../../db";
import { WinemakerNotFoundError } from "../wines/wines.errors";
import type {
  EventRow,
  UpdateWinemakerData,
  WinemakerListItem,
  WinemakerWithRelations,
} from "./winemakers.repository";
import * as winemakersRepo from "./winemakers.repository";

export class WinemakersService {
  async getWinemaker(id: string): Promise<WinemakerWithRelations> {
    const winemaker = await winemakersRepo.findById(db, id);
    if (!winemaker) throw new WinemakerNotFoundError();
    return winemaker;
  }

  async getWinemakerEvents(id: string): Promise<EventRow[]> {
    const winemaker = await winemakersRepo.findById(db, id);
    if (!winemaker) throw new WinemakerNotFoundError();
    return winemakersRepo.findEventsByWinemakerId(db, id);
  }

  async getWinemakerWines(id: string): Promise<Wine[]> {
    const winemaker = await winemakersRepo.findById(db, id);
    if (!winemaker) throw new WinemakerNotFoundError();
    return winemakersRepo.findWinesByWinemakerId(db, id);
  }

  listWinemakers(filters: { q?: string } = {}): Promise<WinemakerListItem[]> {
    return winemakersRepo.findAll(db, filters);
  }

  async getMyProfile(userId: string): Promise<WinemakerListItem> {
    const winemaker = await winemakersRepo.findByUserId(db, userId);
    if (!winemaker) throw new WinemakerNotFoundError();
    const profile = await winemakersRepo.findByIdWithAddress(db, winemaker.id);
    if (!profile) throw new WinemakerNotFoundError();
    return profile;
  }

  async updateMyProfile(userId: string, data: UpdateWinemakerData): Promise<WinemakerListItem> {
    const winemaker = await winemakersRepo.findByUserId(db, userId);
    if (!winemaker) throw new WinemakerNotFoundError();

    await winemakersRepo.updateById(db, winemaker.id, data);
    const updated = await winemakersRepo.findByIdWithAddress(db, winemaker.id);
    if (!updated) throw new WinemakerNotFoundError();
    return updated;
  }
}

export const winemakersService = new WinemakersService();
