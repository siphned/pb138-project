import { ConflictError, ForbiddenError } from "@repo/shared";
import type { Wine } from "@repo/shared/schemas";
import { db } from "../../db";
import type { PaginatedResult } from "../../utils/pagination";
import { parsePagination } from "../../utils/pagination";
import { WinemakerNotFoundError } from "../wines/wines.errors";
import type {
  EventRow,
  UpdateWinemakerData,
  WinemakerListItem,
  WinemakerWithRelations,
} from "./winemakers.repository";
import * as winemakersRepo from "./winemakers.repository";

type CreateWinemakerData = {
  name: string;
  description: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
  address: {
    country: string;
    city: string;
    postalCode: string;
    street: string;
    houseNumber: string;
  };
};

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

  async listWinemakers(
    query: { q?: string; city?: string; page?: number; limit?: number } = {}
  ): Promise<PaginatedResult<WinemakerListItem>> {
    const { page, limit: limitParam, ...filters } = query;
    const { limit, offset } = parsePagination({ limit: limitParam, page });
    const { rows, total } = await winemakersRepo.findAll(db, filters, { limit, offset });
    return { data: rows, limit, page: Math.max(1, page ?? 1), total };
  }

  async createMyProfile(userId: string, data: CreateWinemakerData): Promise<WinemakerListItem> {
    const existing = await winemakersRepo.findByUserId(db, userId);
    if (existing) {
      throw new ConflictError("You already have a winemaker profile", "WINEMAKER_PROFILE_EXISTS");
    }

    const winemaker = await db.transaction(async (tx) => {
      const address = await winemakersRepo.insertAddress(tx, data.address);
      return winemakersRepo.createWinemaker(tx, {
        addressId: address.id,
        description: data.description,
        email: data.email,
        name: data.name,
        phone: data.phone,
        userId,
        websiteUrl: data.websiteUrl,
      });
    });

    const created = await winemakersRepo.findByIdWithAddress(db, winemaker.id);
    if (!created) throw new WinemakerNotFoundError();
    return created;
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

  async updateWinemakerById(
    id: string,
    actorUserId: string,
    roles: string[],
    data: UpdateWinemakerData
  ): Promise<WinemakerListItem> {
    const winemaker = await winemakersRepo.findByIdWithAddress(db, id);
    if (!winemaker) throw new WinemakerNotFoundError();

    const isAdmin = roles.includes("admin");
    const isOwner = winemaker.userId === actorUserId;
    if (!isAdmin && !isOwner)
      throw new ForbiddenError(
        "You do not have permission to edit this winemaker profile",
        "FORBIDDEN_WINEMAKER_ACTION"
      );

    await winemakersRepo.updateById(db, id, data);
    const updated = await winemakersRepo.findByIdWithAddress(db, id);
    if (!updated) throw new WinemakerNotFoundError();
    return updated;
  }
}

export const winemakersService = new WinemakersService();
