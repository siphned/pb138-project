import type { PaginatedResult } from "../../utils/pagination";
import { parsePagination } from "../../utils/pagination";
import type { AdminEventRow, AdminReviewRow, AdminUserRow } from "./admin.repository";
import { adminRepository } from "./admin.repository";

export const adminService = {
  async listUsers(
    filters: { status?: "active" | "suspended" | "banned"; role?: "user" | "admin" },
    paginationQuery: { page?: number; limit?: number }
  ): Promise<PaginatedResult<AdminUserRow>> {
    const { limit, offset } = parsePagination(paginationQuery);
    const page = Math.max(1, paginationQuery.page ?? 1);
    const { data, total } = await adminRepository.listUsers(filters, { limit, offset });
    return { data, page, limit, total };
  },

  async changeUserStatus(
    userId: string,
    newStatus: "active" | "suspended" | "banned"
  ): Promise<AdminUserRow> {
    const user = await adminRepository.findUserById(userId);
    if (!user) throw new Error("NOT_FOUND");
    return adminRepository.setUserStatus(userId, newStatus);
  },

  async listEvents(
    filters: { status?: "pending" | "approved" | "rejected" },
    paginationQuery: { page?: number; limit?: number }
  ): Promise<PaginatedResult<AdminEventRow>> {
    const { limit, offset } = parsePagination(paginationQuery);
    const page = Math.max(1, paginationQuery.page ?? 1);
    const status = filters.status ?? "pending";
    const { data, total } = await adminRepository.listEvents({ status }, { limit, offset });
    return { data, page, limit, total };
  },

  async setEventStatus(
    eventId: string,
    newStatus: "approved" | "rejected"
  ): Promise<AdminEventRow> {
    const event = await adminRepository.findEventById(eventId);
    if (!event) throw new Error("NOT_FOUND");
    if (event.status !== "pending") throw new Error("CONFLICT");
    await adminRepository.setEventStatus(eventId, newStatus);
    const updated = await adminRepository.findEventWithDetailsById(eventId);
    if (!updated) throw new Error("NOT_FOUND");
    return updated;
  },

  async listReviews(paginationQuery: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<AdminReviewRow>> {
    const { limit, offset } = parsePagination(paginationQuery);
    const page = Math.max(1, paginationQuery.page ?? 1);
    const { data, total } = await adminRepository.listAllReviews({ limit, offset });
    return { data, page, limit, total };
  },

  async deleteReview(reviewId: string, type: "product" | "winemaker"): Promise<void> {
    if (type === "product") {
      const review = await adminRepository.findProductReviewById(reviewId);
      if (!review) throw new Error("NOT_FOUND");
      await adminRepository.softDeleteProductReview(reviewId);
    } else {
      const review = await adminRepository.findWinemakerReviewById(reviewId);
      if (!review) throw new Error("NOT_FOUND");
      await adminRepository.softDeleteWinemakerReview(reviewId);
    }
  },
};
