import type { AvailabilityException, AvailabilityRegular } from "@repo/shared/schemas";
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
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
<<<<<<< HEAD
    if (ends <= starts) throw new InvalidTimeRangeError();

    return availabilityRepo.insertException(db, {
=======
    if (ends <= starts) throw new Error("INVALID_TIME_RANGE");

    return this.availabilityRepo.insertException({
>>>>>>> origin/main
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
<<<<<<< HEAD
    if (end <= start) throw new InvalidTimeRangeError();

    if (data.validTo !== undefined && data.validTo <= data.validFrom)
      throw new InvalidTimeRangeError();

    return availabilityRepo.insertRegular(db, {
=======
    if (end <= start) throw new Error("INVALID_TIME_RANGE");

    if (data.validTo !== undefined && data.validTo <= data.validFrom)
      throw new Error("INVALID_TIME_RANGE");

    return this.availabilityRepo.insertRegular({
>>>>>>> origin/main
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

<<<<<<< HEAD
    const entry = await availabilityRepo.findExceptionById(db, entryId);
    if (!entry || entry.shopId !== shopId) throw new AvailabilityEntryNotFoundError();

    await availabilityRepo.deleteException(db, entryId);
=======
    const entry = await this.availabilityRepo.findExceptionById(entryId);
    if (!entry || entry.shopId !== shopId) throw new Error("NOT_FOUND");

    await this.availabilityRepo.deleteException(entryId);
>>>>>>> origin/main
  }

  async deleteRegular(shopId: string, entryId: string, requesterId: string): Promise<void> {
    await this.assertShopOwnership(shopId, requesterId);

<<<<<<< HEAD
    const entry = await availabilityRepo.findRegularById(db, entryId);
    if (!entry || entry.shopId !== shopId) throw new AvailabilityEntryNotFoundError();

    await availabilityRepo.deleteRegular(db, entryId);
=======
    const entry = await this.availabilityRepo.findRegularById(entryId);
    if (!entry || entry.shopId !== shopId) throw new Error("NOT_FOUND");

    await this.availabilityRepo.deleteRegular(entryId);
>>>>>>> origin/main
  }

  async getAvailability(shopId: string): Promise<{
    regular: AvailabilityRegular[];
    exceptions: AvailabilityException[];
  }> {
<<<<<<< HEAD
    const shop = await availabilityRepo.findShopById(db, shopId);
    if (!shop) throw new ShopNotFoundError(shopId);

    const [regular, exceptions] = await Promise.all([
      availabilityRepo.findRegularByShopId(db, shopId),
      availabilityRepo.findExceptionsByShopId(db, shopId),
=======
    const shop = await this.availabilityRepo.findShopById(shopId);
    if (!shop) throw new Error("NOT_FOUND");

    const [regular, exceptions] = await Promise.all([
      this.availabilityRepo.findRegularByShopId(shopId),
      this.availabilityRepo.findExceptionsByShopId(shopId),
>>>>>>> origin/main
    ]);

    return { exceptions, regular };
  }
}

<<<<<<< HEAD
export const availabilityService = new AvailabilityService();
=======
export const availabilityService = new AvailabilityService(availabilityRepository);
>>>>>>> origin/main
