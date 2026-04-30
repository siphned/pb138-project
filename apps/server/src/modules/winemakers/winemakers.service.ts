import type { Wine } from "@repo/shared/schemas";
import type {
  EventRow,
  IWinemakersRepository,
  UpdateWinemakerData,
  WinemakerListItem,
  WinemakerWithRelations,
} from "./winemakers.repository";
import { winemakersRepository } from "./winemakers.repository";

export class WinemakersService {
  constructor(private winemakersRepo: IWinemakersRepository) {}

  async getWinemaker(id: string): Promise<WinemakerWithRelations> {
    const winemaker = await this.winemakersRepo.findById(id);
    if (!winemaker) throw new Error("NOT_FOUND");
    return winemaker;
  }

  async getWinemakerEvents(id: string): Promise<EventRow[]> {
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
    return updated;
  }
}

export const winemakersService = new WinemakersService(winemakersRepository);
