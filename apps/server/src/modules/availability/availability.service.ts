import type { AvailabilityException, AvailabilityRegular } from "@repo/shared/schemas";
import { db } from "../../db";
import { ForbiddenShopActionError, ShopNotFoundError } from "../shops/shops.errors";
import { AvailabilityEntryNotFoundError, InvalidTimeRangeError } from "./availability.errors";
import * as availabilityRepo from "./availability.repository";

function parseTime(hhmm: string): Date {
  const [hours = 0, minutes = 0] = hhmm.split(":").map(Number);
  const date = new Date(0);
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

export class AvailabilityService {
  private async assertShopOwnership(shopId: string, requesterId: string): Promise<void> {
    const shop = await availabilityRepo.findShopById(db, shopId);
    if (!shop) throw new ShopNotFoundError(shopId);
    if (shop.ownerUserId !== requesterId) throw new ForbiddenShopActionError();
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
    if (ends <= starts) throw new InvalidTimeRangeError();

    return availabilityRepo.insertException(db, {
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
    if (end <= start) throw new InvalidTimeRangeError();

    if (data.validTo !== undefined && data.validTo <= data.validFrom)
      throw new InvalidTimeRangeError();

    return availabilityRepo.insertRegular(db, {
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

    const entry = await availabilityRepo.findExceptionById(db, entryId);
    if (!entry || entry.shopId !== shopId) throw new AvailabilityEntryNotFoundError();

    await availabilityRepo.deleteException(db, entryId);
  }

  async deleteRegular(shopId: string, entryId: string, requesterId: string): Promise<void> {
    await this.assertShopOwnership(shopId, requesterId);

    const entry = await availabilityRepo.findRegularById(db, entryId);
    if (!entry || entry.shopId !== shopId) throw new AvailabilityEntryNotFoundError();

    await availabilityRepo.deleteRegular(db, entryId);
  }

  async getAvailability(shopId: string): Promise<{
    regular: AvailabilityRegular[];
    exceptions: AvailabilityException[];
  }> {
    const shop = await availabilityRepo.findShopById(db, shopId);
    if (!shop) throw new ShopNotFoundError(shopId);

    const [regular, exceptions] = await Promise.all([
      availabilityRepo.findRegularByShopId(db, shopId),
      availabilityRepo.findExceptionsByShopId(db, shopId),
    ]);

    return { exceptions, regular };
  }
}

export const availabilityService = new AvailabilityService();
