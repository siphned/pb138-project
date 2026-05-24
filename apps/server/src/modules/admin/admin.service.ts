<<<<<<< HEAD
import { db } from "../../db";
import { logger } from "../../utils/logger";
import { emailService } from "../email/email.service";
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
  async getUser(userId: string): Promise<AdminUserRow> {
    const user = await adminRepo.findUserById(db, userId);
    if (!user) throw new Error("NOT_FOUND");
    return user;
  }

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
=======
import { emailService, type IEmailService } from "../email/email.service";
import {
  type IWinemakersRepository,
  winemakersRepository,
} from "../winemakers/winemakers.repository";
import {
  type AdminEventRow,
  type AdminReviewRow,
  type AdminUserRow,
  adminRepository,
  type IAdminRepository,
} from "./admin.repository";

export class AdminService {
  constructor(
    private adminRepo: IAdminRepository,
    private winemakersRepo: IWinemakersRepository,
    private emailService: IEmailService
  ) {}

  async approveEvent(eventId: string): Promise<AdminEventRow> {
    const event = await this.adminRepo.findEventById(eventId);
    if (!event) throw new Error("NOT_FOUND");
    if (event.status !== "pending") throw new Error("NOT_PENDING");

    await this.adminRepo.setEventStatus(eventId, "approved");
    const updated = await this.adminRepo.findEventWithDetailsById(eventId);
    if (!updated) throw new Error("NOT_FOUND");

    // Notify winemaker
    const winemaker = await this.winemakersRepo.findById(updated.winemakerId);
    if (winemaker?.email) {
      await this.emailService
>>>>>>> origin/main
        .sendEventApproval(winemaker.email, {
          endTime: updated.endTime,
          eventName: updated.name,
          startTime: updated.startTime,
          winemakerName: winemaker.name,
        })
<<<<<<< HEAD
        .catch((e) => logger.error({ err: e, eventId }, "Failed to send event approval email"));
=======
        .catch(() => {
          /* ignore */
        });
>>>>>>> origin/main
    }

    return updated;
  }

  async deleteReview(reviewId: string): Promise<void> {
<<<<<<< HEAD
    const review = await adminRepo.findReviewById(db, reviewId);
    if (!review) throw new AdminReviewNotFoundError();

    await adminRepo.softDeleteReview(db, reviewId);
=======
    const review = await this.adminRepo.findReviewById(reviewId);
    if (!review) throw new Error("NOT_FOUND");

    await this.adminRepo.softDeleteReview(reviewId);
>>>>>>> origin/main
  }

  listAllReviews({ limit = 20, offset = 0 } = {}): Promise<{
    data: AdminReviewRow[];
    total: number;
  }> {
<<<<<<< HEAD
    return adminRepo.listAllReviews(db, { limit, offset });
=======
    return this.adminRepo.listAllReviews({ limit, offset });
>>>>>>> origin/main
  }

  listEvents(
    { status }: { status: "pending" | "approved" | "rejected" },
    { limit = 20, offset = 0 } = {}
  ): Promise<{ data: AdminEventRow[]; total: number }> {
<<<<<<< HEAD
    return adminRepo.listEvents(db, { status }, { limit, offset });
=======
    return this.adminRepo.listEvents({ status }, { limit, offset });
>>>>>>> origin/main
  }

  listUsers(
    filters: { status?: "active" | "suspended" | "banned"; role?: string },
    { limit = 20, offset = 0 } = {}
  ): Promise<{ data: AdminUserRow[]; total: number }> {
<<<<<<< HEAD
    return adminRepo.listUsers(db, filters, { limit, offset });
  }

  async rejectEvent(eventId: string): Promise<AdminEventRow> {
    const event = await adminRepo.findEventById(db, eventId);
    if (!event) throw new AdminEventNotFoundError();
    if (event.status !== "pending") throw new EventNotPendingError();

    await adminRepo.setEventStatus(db, eventId, "rejected");
    const updated = await adminRepo.findEventWithDetailsById(db, eventId);
    if (!updated) throw new AdminEventNotFoundError();
=======
    return this.adminRepo.listUsers(filters, { limit, offset });
  }

  async rejectEvent(eventId: string): Promise<AdminEventRow> {
    const event = await this.adminRepo.findEventById(eventId);
    if (!event) throw new Error("NOT_FOUND");
    if (event.status !== "pending") throw new Error("NOT_PENDING");

    await this.adminRepo.setEventStatus(eventId, "rejected");
    const updated = await this.adminRepo.findEventWithDetailsById(eventId);
    if (!updated) throw new Error("NOT_FOUND");
>>>>>>> origin/main
    return updated;
  }

  async setUserStatus(
    userId: string,
    newStatus: "active" | "suspended" | "banned"
  ): Promise<AdminUserRow> {
<<<<<<< HEAD
    const user = await adminRepo.findUserById(db, userId);
    if (!user) throw new AdminUserNotFoundError();

    return adminRepo.setUserStatus(db, userId, newStatus);
  }
}

export const adminService = new AdminService();
=======
    const user = await this.adminRepo.findUserById(userId);
    if (!user) throw new Error("NOT_FOUND");

    return this.adminRepo.setUserStatus(userId, newStatus);
  }
}

export const adminService = new AdminService(adminRepository, winemakersRepository, emailService);
>>>>>>> origin/main
