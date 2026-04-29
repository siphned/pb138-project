import type { Wine } from "@repo/shared/schemas";
import type {
  EventRow,
  UpdateWinemakerData,
  WinemakerListItem,
  WinemakerWithRelations,
} from "./winemakers.repository";
import { winemakersRepository } from "./winemakers.repository";

export const winemakersService = {
  async getWinemaker(id: string): Promise<WinemakerWithRelations> {
    const winemaker = await winemakersRepository.findById(id);
    if (!winemaker) throw new Error("NOT_FOUND");
    return winemaker;
  },

  async getWinemakerEvents(id: string): Promise<EventRow[]> {
    const winemaker = await winemakersRepository.findById(id);
    if (!winemaker) throw new Error("NOT_FOUND");
    return winemakersRepository.findEventsByWinemakerId(id);
  },

  async getWinemakerWines(id: string): Promise<Wine[]> {
    const winemaker = await winemakersRepository.findById(id);
    if (!winemaker) throw new Error("NOT_FOUND");
    return winemakersRepository.findWinesByWinemakerId(id);
  },
  listWinemakers(): Promise<WinemakerListItem[]> {
    return winemakersRepository.findAll();
  },

  async updateMyProfile(userId: string, data: UpdateWinemakerData): Promise<WinemakerListItem> {
    const winemaker = await winemakersRepository.findByUserId(userId);
    if (!winemaker) throw new Error("NOT_FOUND");

    await winemakersRepository.updateById(winemaker.id, data);
    const updated = await winemakersRepository.findByIdWithAddress(winemaker.id);
    if (!updated) throw new Error("NOT_FOUND");
    return updated;
  },
};
