import type { AdminEventRow, AdminReviewRow, AdminUserRow } from "./admin.repository";
import { adminRepository } from "./admin.repository";
import { emailService } from "../email";

export const adminService = {
  async approveEvent(eventId: string): Promise<AdminEventRow> {
    const event = await adminRepository.findEventById(eventId);
    if (!event) throw new Error("NOT_FOUND");
    if (event.status !== "pending") throw new Error("NOT_PENDING");

    await adminRepository.setEventStatus(eventId, "approved");
    const updated = await adminRepository.findEventWithDetailsById(eventId);
    if (!updated) throw new Error("NOT_FOUND");

    if (newStatus === "approved" && updated.winemaker?.email) {
      emailService
        .sendEventApproval(updated.winemaker.email, {
          eventName: updated.name,
          startTime: updated.startTime,
          endTime: updated.endTime,
        })
        .catch(console.error);
    }

    return updated;
  },

  async deleteReview(reviewId: string): Promise<void> {
    const review = await adminRepository.findReviewById(reviewId);
    if (!review) throw new Error("NOT_FOUND");

    await adminRepository.softDeleteReview(reviewId);
  },

  // Reviews
  listAllReviews({ limit = 20, offset = 0 } = {}): Promise<{
    data: AdminReviewRow[];
    total: number;
  }> {
    return adminRepository.listAllReviews({ limit, offset });
  },

  // Events
  listEvents(
    { status }: { status: "pending" | "approved" | "rejected" },
    { limit = 20, offset = 0 } = {}
  ): Promise<{ data: AdminEventRow[]; total: number }> {
    return adminRepository.listEvents({ status }, { limit, offset });
  },
  // Users
  listUsers(
    filters: { status?: "active" | "suspended" | "banned"; role?: "user" | "admin" },
    { limit = 20, offset = 0 } = {}
  ): Promise<{ data: AdminUserRow[]; total: number }> {
    return adminRepository.listUsers(filters, { limit, offset });
  },

  async rejectEvent(eventId: string): Promise<AdminEventRow> {
    const event = await adminRepository.findEventById(eventId);
    if (!event) throw new Error("NOT_FOUND");
    if (event.status !== "pending") throw new Error("NOT_PENDING");

    await adminRepository.setEventStatus(eventId, "rejected");
    const updated = await adminRepository.findEventWithDetailsById(eventId);
    if (!updated) throw new Error("NOT_FOUND");
    return updated;
  },

  async setUserStatus(
    userId: string,
    newStatus: "active" | "suspended" | "banned"
  ): Promise<AdminUserRow> {
    const user = await adminRepository.findUserById(userId);
    if (!user) throw new Error("NOT_FOUND");

    return adminRepository.setUserStatus(userId, newStatus);
  },
};
