import { db } from "../../db";
import { emailService } from "../email/email.service";
import { logger } from "../../utils/logger";
import * as winemakersRepo from "../winemakers/winemakers.repository";
import {
  AdminEventNotFoundError,
  AdminReviewNotFoundError,
  AdminUserNotFoundError,
  EventNotPendingError,
} from "./admin.errors";
import type { AdminEventRow, AdminReviewRow, AdminUserRow } from "./admin.repository";
import * as adminRepo from "./admin.repository";

export class AdminService {
  async approveEvent(eventId: string): Promise<AdminEventRow> {
    const event = await adminRepo.findEventById(db, eventId);
    if (!event) throw new AdminEventNotFoundError();
    if (event.status !== "pending") throw new EventNotPendingError();

    await adminRepo.setEventStatus(db, eventId, "approved");
    const updated = await adminRepo.findEventWithDetailsById(db, eventId);
    if (!updated) throw new AdminEventNotFoundError();

    // Notify winemaker
    const winemaker = await winemakersRepo.findById(db, updated.winemakerId);
    if (winemaker?.email) {
      await emailService
        .sendEventApproval(winemaker.email, {
          endTime: updated.endTime,
          eventName: updated.name,
          startTime: updated.startTime,
          winemakerName: winemaker.name,
        })
        .catch((e) => logger.error({ err: e, eventId }, "Failed to send event approval email"));
    }

    return updated;
  }

  async deleteReview(reviewId: string): Promise<void> {
    const review = await adminRepo.findReviewById(db, reviewId);
    if (!review) throw new AdminReviewNotFoundError();

    await adminRepo.softDeleteReview(db, reviewId);
  }

  listAllReviews({ limit = 20, offset = 0 } = {}): Promise<{
    data: AdminReviewRow[];
    total: number;
  }> {
    return adminRepo.listAllReviews(db, { limit, offset });
  }

  listEvents(
    { status }: { status: "pending" | "approved" | "rejected" },
    { limit = 20, offset = 0 } = {}
  ): Promise<{ data: AdminEventRow[]; total: number }> {
    return adminRepo.listEvents(db, { status }, { limit, offset });
  }

  listUsers(
    filters: { status?: "active" | "suspended" | "banned"; role?: string },
    { limit = 20, offset = 0 } = {}
  ): Promise<{ data: AdminUserRow[]; total: number }> {
    return adminRepo.listUsers(db, filters, { limit, offset });
  }

  async rejectEvent(eventId: string): Promise<AdminEventRow> {
    const event = await adminRepo.findEventById(db, eventId);
    if (!event) throw new AdminEventNotFoundError();
    if (event.status !== "pending") throw new EventNotPendingError();

    await adminRepo.setEventStatus(db, eventId, "rejected");
    const updated = await adminRepo.findEventWithDetailsById(db, eventId);
    if (!updated) throw new AdminEventNotFoundError();
    return updated;
  }

  async setUserStatus(
    userId: string,
    newStatus: "active" | "suspended" | "banned"
  ): Promise<AdminUserRow> {
    const user = await adminRepo.findUserById(db, userId);
    if (!user) throw new AdminUserNotFoundError();

    return adminRepo.setUserStatus(db, userId, newStatus);
  }
}

export const adminService = new AdminService();
