import { createClerkClient } from "@clerk/backend";
import { NotFoundError } from "@repo/shared";
import type { RoleRequest } from "@repo/shared/schemas";
import { db } from "../../db";
import { logger } from "../../utils/logger";
import { emailService } from "../email/email.service";
import { UserNotFoundError } from "../users/users.errors";
import * as usersRepo from "../users/users.repository";
import { usersService } from "../users/users.service";
import {
  AlreadyHasPendingRequestError,
  AlreadyRespondedError,
  RoleRequestNotFoundError,
} from "./role-requests.errors";
import * as roleRequestsRepo from "./role-requests.repository";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export class RoleRequestsService {
  async approve(requestId: string, adminUserId: string): Promise<RoleRequest> {
    const request = await roleRequestsRepo.findById(db, requestId);
    if (!request) throw new RoleRequestNotFoundError();
    if (request.status !== "pending") throw new AlreadyRespondedError();

    const user = await usersRepo.findById(db, request.userId);
    if (!user) throw new UserNotFoundError(request.userId);

    // RBAC reads roles from `public_metadata.roles` (an array) everywhere —
    // see users.service syncRolesToDatabase and the auth plugin. Append the
    // granted role to that array (read-modify-write so we don't clobber the
    // existing roles such as "customer"), then sync our DB immediately rather
    // than waiting on the Clerk webhook (which isn't wired up in local dev).
    const clerkUser = await clerkClient.users.getUser(user.clerkId);
    const currentRoles = (clerkUser.publicMetadata?.roles as string[] | undefined) ?? [];
    const nextRoles = currentRoles.includes(request.type)
      ? currentRoles
      : [...currentRoles, request.type];

    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: { roles: nextRoles },
    });

    await usersService.syncRolesToDatabase(user.id, nextRoles);

    const result = await roleRequestsRepo.updateStatus(db, requestId, "approved", adminUserId);

    emailService
      .sendRoleRequestApproved(user.email, {
        fname: user.fname,
        role: request.type,
      })
      .catch((e) =>
        logger.error(
          { err: e, requestId, userId: request.userId },
          "Failed to send role approval email"
        )
      );

    return result;
  }

  async getById(requestId: string): Promise<RoleRequest> {
    const request = await roleRequestsRepo.findById(db, requestId);
    if (!request) throw new NotFoundError("Role request not found", "ROLE_REQUEST_NOT_FOUND");
    return request;
  }

  listPending(): Promise<RoleRequest[]> {
    return roleRequestsRepo.findPending(db);
  }

  async reject(requestId: string, adminUserId: string): Promise<RoleRequest> {
    const request = await roleRequestsRepo.findById(db, requestId);
    if (!request) throw new RoleRequestNotFoundError();
    if (request.status !== "pending") throw new AlreadyRespondedError();

    const result = await roleRequestsRepo.updateStatus(db, requestId, "rejected", adminUserId);

    const rejectedUser = await usersRepo.findById(db, request.userId).catch(() => null);
    if (rejectedUser) {
      emailService
        .sendRoleRequestRejected(rejectedUser.email, {
          fname: rejectedUser.fname,
          role: request.type,
        })
        .catch((e) =>
          logger.error(
            { err: e, requestId, userId: request.userId },
            "Failed to send role rejection email"
          )
        );
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

    if (pending) throw new AlreadyHasPendingRequestError();

    return roleRequestsRepo.create(db, {
      businessName,
      details,
      type,
      userId,
    });
  }
}

export const roleRequestsService = new RoleRequestsService();
