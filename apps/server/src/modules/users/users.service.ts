import { db } from "../../db";
import { imagesService } from "../images/images.service";
import type { User } from "@repo/shared/schemas";
import { addresses } from "@repo/shared/schemas";
import * as usersRepo from "./users.repository";

class UsersService {
  async lazyGetOrCreate(clerkId: string): Promise<User> {
    const existing = await usersRepo.findByClerkId(db, clerkId);
    if (existing) return existing;

    return usersRepo.create(db, { clerkId, status: "active" });
  }

  async syncUserFromWebhook(data: { id: string } & Record<string, unknown>): Promise<void> {
    const clerkId = data.id;
    const fname = (data.first_name as string) ?? "";
    const lname = (data.last_name as string) ?? "";

    const existing = await usersRepo.findByClerkId(db, clerkId);
    if (existing) {
      await usersRepo.updateById(db, existing.id, { fname, lname });
    } else {
      await usersRepo.create(db, { clerkId, fname, lname, status: "active" });
    }
  }

  async deleteUserFromWebhook(clerkId: string): Promise<void> {
    const user = await usersRepo.findByClerkId(db, clerkId);
    if (!user) return;
    await usersRepo.updateById(db, user.id, { deletedAt: new Date(), status: "deleted" });
  }

  updateProfileById(userId: string, data: { fname?: string; lname?: string }): Promise<User> {
    return usersRepo.updateById(db, userId, data);
  }

  async upsertAddress(
    userId: string,
    type: "shipping" | "billing",
    addressData: unknown
  ): Promise<void> {
    const {
      country,
      city,
      postalCode,
      street,
      houseNumber,
    } = addressData as {
      country?: string;
      city?: string;
      postalCode?: string;
      street?: string;
      houseNumber?: string;
    };

    if (!country || !city || !postalCode || !street || !houseNumber) {
      throw new Error("Missing address fields");
    }

    // Upsert: delete existing address of same type, insert new
    const existing = await usersRepo.findAddressByType(db, userId, type);
    if (existing) {
      await db
        .update(addresses)
        .set({ deletedAt: new Date() })
        .where(eq(addresses.id, existing.id));
    }

    await db.insert(addresses).values({
      city,
      country,
      houseNumber,
      postalCode,
      street,
      userId,
      type,
    });
  }

  async getProfile(userId: string): Promise<User | undefined> {
    return usersRepo.findById(db, userId);
  }

  async uploadImage(userId: string, file: File): Promise<string> {
    const user = await usersRepo.findById(db, userId);
    if (!user) throw new Error("User not found");

    // Delete old avatar if exists
    if (user.avatarUrl) {
      await imagesService.deleteImage(user.avatarUrl);
    }

    const url = await imagesService.uploadImage(file, `users/${userId}/avatar`);
    await usersRepo.updateById(db, userId, { avatarUrl: url });
    return url;
  }
}

export const usersService = new UsersService();
