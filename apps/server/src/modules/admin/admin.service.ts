import { db } from "../../db";
import { AdminReviewNotFoundError, AdminUserNotFoundError } from "./admin.errors";
import type { AdminReviewRow, AdminUserRow } from "./admin.repository";
import * as adminRepo from "./admin.repository";

export class AdminService {
  async getUser(userId: string): Promise<AdminUserRow> {
    const user = await adminRepo.findUserById(db, userId);
    if (!user) throw new Error("NOT_FOUND");
    return user;
  }

  async deleteReview(reviewId: string): Promise<void> {
    const review = await adminRepo.findReviewById(db, reviewId);
    if (!review) throw new AdminReviewNotFoundError();
    await adminRepo.softDeleteReview(db, reviewId);
  }

  async unflagReview(reviewId: string): Promise<void> {
    const review = await adminRepo.findReviewById(db, reviewId);
    if (!review) throw new AdminReviewNotFoundError();
    await adminRepo.unflagReview(db, reviewId);
  }

  listAllReviews({ limit = 20, offset = 0 } = {}): Promise<{
    data: AdminReviewRow[];
    total: number;
  }> {
    return adminRepo.listAllReviews(db, { limit, offset });
  }

  listUsers(
    filters: { status?: "active" | "suspended" | "banned"; role?: string },
    { limit = 20, offset = 0 } = {}
  ): Promise<{ data: AdminUserRow[]; total: number }> {
    return adminRepo.listUsers(db, filters, { limit, offset });
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
