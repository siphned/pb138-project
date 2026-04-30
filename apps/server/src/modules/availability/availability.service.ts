import type { AvailabilityException, AvailabilityRegular } from "@repo/shared/schemas";
import { availabilityRepository, type IAvailabilityRepository } from "./availability.repository";

function parseTime(hhmm: string): Date {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  const d = new Date(0);
  d.setUTCHours(h, m, 0, 0);
  return d;
}

export class AvailabilityService {
  constructor(private availabilityRepo: IAvailabilityRepository) {}

  private async assertShopOwnership(shopId: string, requesterId: string): Promise<void> {
    const shop = await this.availabilityRepo.findShopById(shopId);
    if (!shop) throw new Error("NOT_FOUND");
    if (shop.ownerUserId !== requesterId) throw new Error("FORBIDDEN");
  }

  async addException(
    shopId: string,
    requesterId: string,
    data: {
      startsAt: string;
      endsAt: string;
      action: "closed" | "modified_hours" | "special_event";
      reason?: string;
    }
  ): Promise<AvailabilityException> {
    await this.assertShopOwnership(shopId, requesterId);

    const starts = new Date(data.startsAt);
    const ends = new Date(data.endsAt);
    if (ends <= starts) throw new Error("INVALID_TIME_RANGE");

    return this.availabilityRepo.insertException({
      action: data.action,
      endsAt: ends,
      reason: data.reason,
      shopId,
      startsAt: starts,
    });
  }

  async addRegular(
    shopId: string,
    requesterId: string,
    data: {
      dow: number;
      startTime: string;
      endTime: string;
      validFrom: string;
      validTo?: string;
      type: "open" | "closed";
    }
  ): Promise<AvailabilityRegular> {
    await this.assertShopOwnership(shopId, requesterId);

    const start = parseTime(data.startTime);
    const end = parseTime(data.endTime);
    if (end <= start) throw new Error("INVALID_TIME_RANGE");

    if (data.validTo !== undefined && data.validTo <= data.validFrom)
      throw new Error("INVALID_TIME_RANGE");

    return this.availabilityRepo.insertRegular({
      dow: data.dow,
      endTime: end,
      shopId,
      startTime: start,
      type: data.type,
      validFrom: data.validFrom,
      validTo: data.validTo,
    });
  }

  async deleteException(shopId: string, entryId: string, requesterId: string): Promise<void> {
    await this.assertShopOwnership(shopId, requesterId);

    const entry = await this.availabilityRepo.findExceptionById(entryId);
    if (!entry || entry.shopId !== shopId) throw new Error("NOT_FOUND");

    await this.availabilityRepo.deleteException(entryId);
  }

  async deleteRegular(shopId: string, entryId: string, requesterId: string): Promise<void> {
    await this.assertShopOwnership(shopId, requesterId);

    const entry = await this.availabilityRepo.findRegularById(entryId);
    if (!entry || entry.shopId !== shopId) throw new Error("NOT_FOUND");

    await this.availabilityRepo.deleteRegular(entryId);
  }

  async getAvailability(shopId: string): Promise<{
    regular: AvailabilityRegular[];
    exceptions: AvailabilityException[];
  }> {
    const shop = await this.availabilityRepo.findShopById(shopId);
    if (!shop) throw new Error("NOT_FOUND");

    const [regular, exceptions] = await Promise.all([
      this.availabilityRepo.findRegularByShopId(shopId),
      this.availabilityRepo.findExceptionsByShopId(shopId),
    ]);

    return { exceptions, regular };
  }
}

export const availabilityService = new AvailabilityService(availabilityRepository);
