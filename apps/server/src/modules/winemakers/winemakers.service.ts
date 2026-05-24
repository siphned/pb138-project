import type { Wine } from "@repo/shared/schemas";
<<<<<<< HEAD
import { db } from "../../db";
import { WinemakerNotFoundError } from "../wines/wines.errors";
import type {
  EventRow,
=======
import type {
  EventRow,
  IWinemakersRepository,
>>>>>>> origin/main
  UpdateWinemakerData,
  WinemakerListItem,
  WinemakerWithRelations,
} from "./winemakers.repository";
<<<<<<< HEAD
import * as winemakersRepo from "./winemakers.repository";

export class WinemakersService {
  async getWinemaker(id: string): Promise<WinemakerWithRelations> {
    const winemaker = await winemakersRepo.findById(db, id);
    if (!winemaker) throw new WinemakerNotFoundError();
=======
import { winemakersRepository } from "./winemakers.repository";

export class WinemakersService {
  constructor(private winemakersRepo: IWinemakersRepository) {}

  async getWinemaker(id: string): Promise<WinemakerWithRelations> {
    const winemaker = await this.winemakersRepo.findById(id);
    if (!winemaker) throw new Error("NOT_FOUND");
>>>>>>> origin/main
    return winemaker;
  }

  async getWinemakerEvents(id: string): Promise<EventRow[]> {
<<<<<<< HEAD
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
=======
    const winemaker = await this.winemakersRepo.findById(id);
    if (!winemaker) throw new Error("NOT_FOUND");
    return this.winemakersRepo.findEventsByWinemakerId(id);
  }

  async getWinemakerWines(id: string): Promise<Wine[]> {
    const winemaker = await this.winemakersRepo.findById(id);
    if (!winemaker) throw new Error("NOT_FOUND");
    return this.winemakersRepo.findWinesByWinemakerId(id);
  }

  listWinemakers(): Promise<WinemakerListItem[]> {
    return this.winemakersRepo.findAll();
  }

  async updateMyProfile(userId: string, data: UpdateWinemakerData): Promise<WinemakerListItem> {
    const winemaker = await this.winemakersRepo.findByUserId(userId);
    if (!winemaker) throw new Error("NOT_FOUND");

    await this.winemakersRepo.updateById(winemaker.id, data);
    const updated = await this.winemakersRepo.findByIdWithAddress(winemaker.id);
    if (!updated) throw new Error("NOT_FOUND");
>>>>>>> origin/main
    return updated;
  }
}

<<<<<<< HEAD
export const winemakersService = new WinemakersService();
=======
export const winemakersService = new WinemakersService(winemakersRepository);
>>>>>>> origin/main
