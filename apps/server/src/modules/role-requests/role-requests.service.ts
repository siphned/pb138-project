import { createClerkClient } from "@clerk/backend";
import type { RoleRequest } from "@repo/shared/schemas";
import { db } from "../../db";
import { emailService } from "../email/email.service";
import * as usersRepo from "../users/users.repository";
import * as roleRequestsRepo from "./role-requests.repository";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export class RoleRequestsService {
  async approve(requestId: string, adminUserId: string): Promise<RoleRequest> {
    const request = await roleRequestsRepo.findById(db, requestId);
    if (!request) throw new Error("NOT_FOUND");
    if (request.status !== "pending") throw new Error("ALREADY_RESPONDED");

    const user = await usersRepo.findById(db, request.userId);
    if (!user) throw new Error("USER_NOT_FOUND");

    const metadataKey = request.type === "winemaker" ? "is_winemaker" : "is_shop_owner";

    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: { [metadataKey]: true },
    });

    const result = await roleRequestsRepo.updateStatus(db, requestId, "approved", adminUserId);

    emailService
      .sendRoleRequestApproved(user.email, {
        fname: user.fname,
        role: request.type,
      })
      .catch(() => {
        /* ignore */
      });

    return result;
  }

  listPending(): Promise<RoleRequest[]> {
    return roleRequestsRepo.findPending(db);
  }

  async reject(requestId: string, adminUserId: string): Promise<RoleRequest> {
    const request = await roleRequestsRepo.findById(db, requestId);
    if (!request) throw new Error("NOT_FOUND");
    if (request.status !== "pending") throw new Error("ALREADY_RESPONDED");

    const result = await roleRequestsRepo.updateStatus(db, requestId, "rejected", adminUserId);

    const rejectedUser = await usersRepo.findById(db, request.userId).catch(() => null);
    if (rejectedUser) {
      emailService
        .sendRoleRequestRejected(rejectedUser.email, {
          fname: rejectedUser.fname,
          role: request.type,
        })
        .catch(() => {
          // Email failure must not block the rejection itself.
        });
    }

    return result;
  }

  async submitRequest(
    userId: string,
    type: "winemaker" | "shop_owner",
    businessName: string,
    details?: string
  ): Promise<RoleRequest> {
    const existing = await roleRequestsRepo.findByUserId(db, userId);
    const pending = existing.find((r) => r.type === type && r.status === "pending");

    if (pending) throw new Error("ALREADY_HAS_PENDING_REQUEST");

    return roleRequestsRepo.create(db, {
      businessName,
      details,
      type,
      userId,
    });
  }
}

export const roleRequestsService = new RoleRequestsService();
