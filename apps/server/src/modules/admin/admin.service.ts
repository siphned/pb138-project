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
        .sendEventApproval(winemaker.email, {
          endTime: updated.endTime,
          eventName: updated.name,
          startTime: updated.startTime,
          winemakerName: winemaker.name,
        })
        .catch(() => {
          /* ignore */
        });
    }

    return updated;
  }

  async deleteReview(reviewId: string): Promise<void> {
    const review = await this.adminRepo.findReviewById(reviewId);
    if (!review) throw new Error("NOT_FOUND");

    await this.adminRepo.softDeleteReview(reviewId);
  }

  listAllReviews({ limit = 20, offset = 0 } = {}): Promise<{
    data: AdminReviewRow[];
    total: number;
  }> {
    return this.adminRepo.listAllReviews({ limit, offset });
  }

  listEvents(
    { status }: { status: "pending" | "approved" | "rejected" },
    { limit = 20, offset = 0 } = {}
  ): Promise<{ data: AdminEventRow[]; total: number }> {
    return this.adminRepo.listEvents({ status }, { limit, offset });
  }

  listUsers(
    filters: { status?: "active" | "suspended" | "banned"; role?: string },
    { limit = 20, offset = 0 } = {}
  ): Promise<{ data: AdminUserRow[]; total: number }> {
    return this.adminRepo.listUsers(filters, { limit, offset });
  }

  async rejectEvent(eventId: string): Promise<AdminEventRow> {
    const event = await this.adminRepo.findEventById(eventId);
    if (!event) throw new Error("NOT_FOUND");
    if (event.status !== "pending") throw new Error("NOT_PENDING");

    await this.adminRepo.setEventStatus(eventId, "rejected");
    const updated = await this.adminRepo.findEventWithDetailsById(eventId);
    if (!updated) throw new Error("NOT_FOUND");
    return updated;
  }

  async setUserStatus(
    userId: string,
    newStatus: "active" | "suspended" | "banned"
  ): Promise<AdminUserRow> {
    const user = await this.adminRepo.findUserById(userId);
    if (!user) throw new Error("NOT_FOUND");

    return this.adminRepo.setUserStatus(userId, newStatus);
  }
}

export const adminService = new AdminService(adminRepository, winemakersRepository, emailService);
