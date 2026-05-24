import { createClerkClient } from "@clerk/backend";
<<<<<<< HEAD
import { NotFoundError } from "@repo/shared";
import type { RoleRequest } from "@repo/shared/schemas";
import { db } from "../../db";
import { logger } from "../../utils/logger";
import { emailService } from "../email/email.service";
import { UserNotFoundError } from "../users/users.errors";
import * as usersRepo from "../users/users.repository";
import {
  AlreadyHasPendingRequestError,
  AlreadyRespondedError,
  RoleRequestNotFoundError,
} from "./role-requests.errors";
import * as roleRequestsRepo from "./role-requests.repository";
=======
import type { RoleRequest } from "@repo/shared/schemas";
import { emailService, type IEmailService } from "../email/email.service";
import { type IUsersRepository, usersRepository } from "../users/users.repository";
import { type IRoleRequestsRepository, roleRequestsRepository } from "./role-requests.repository";
>>>>>>> origin/main

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export class RoleRequestsService {
<<<<<<< HEAD
  async approve(requestId: string, adminUserId: string): Promise<RoleRequest> {
    const request = await roleRequestsRepo.findById(db, requestId);
    if (!request) throw new RoleRequestNotFoundError();
    if (request.status !== "pending") throw new AlreadyRespondedError();

    const user = await usersRepo.findById(db, request.userId);
    if (!user) throw new UserNotFoundError(request.userId);
=======
  constructor(
    private roleRequestsRepo: IRoleRequestsRepository,
    private usersRepo: IUsersRepository,
    private emailService: IEmailService
  ) {}

  async approve(requestId: string, adminUserId: string): Promise<RoleRequest> {
    const request = await this.roleRequestsRepo.findById(requestId);
    if (!request) throw new Error("NOT_FOUND");
    if (request.status !== "pending") throw new Error("ALREADY_RESPONDED");

    const user = await this.usersRepo.findById(request.userId);
    if (!user) throw new Error("USER_NOT_FOUND");
>>>>>>> origin/main

    const metadataKey = request.type === "winemaker" ? "is_winemaker" : "is_shop_owner";

    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: { [metadataKey]: true },
    });

<<<<<<< HEAD
    const result = await roleRequestsRepo.updateStatus(db, requestId, "approved", adminUserId);

    emailService
=======
    const result = await this.roleRequestsRepo.updateStatus(requestId, "approved", adminUserId);

    this.emailService
>>>>>>> origin/main
      .sendRoleRequestApproved(user.email, {
        fname: user.fname,
        role: request.type,
      })
<<<<<<< HEAD
      .catch((e) =>
        logger.error(
          { err: e, requestId, userId: request.userId },
          "Failed to send role approval email"
        )
      );
=======
      .catch(() => {
        /* ignore */
      });
>>>>>>> origin/main

    return result;
  }

<<<<<<< HEAD
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
=======
  listPending(): Promise<RoleRequest[]> {
    return this.roleRequestsRepo.findPending();
  }

  async reject(requestId: string, adminUserId: string): Promise<RoleRequest> {
    const request = await this.roleRequestsRepo.findById(requestId);
    if (!request) throw new Error("NOT_FOUND");
    if (request.status !== "pending") throw new Error("ALREADY_RESPONDED");

    const result = await this.roleRequestsRepo.updateStatus(requestId, "rejected", adminUserId);

    this.usersRepo
      .findById(request.userId)
      .then((user) => {
        if (user) {
          this.emailService.sendRoleRequestRejected(user.email, {
            fname: user.fname,
            role: request.type,
          });
        }
      })
      .catch(() => {
        /* ignore */
      });
>>>>>>> origin/main

    return result;
  }

  async submitRequest(
    userId: string,
    type: "winemaker" | "shop_owner",
    businessName: string,
    details?: string
  ): Promise<RoleRequest> {
<<<<<<< HEAD
    const existing = await roleRequestsRepo.findByUserId(db, userId);
    const pending = existing.find((r) => r.type === type && r.status === "pending");

    if (pending) throw new AlreadyHasPendingRequestError();

    return roleRequestsRepo.create(db, {
=======
    const existing = await this.roleRequestsRepo.findByUserId(userId);
    const pending = existing.find((r) => r.type === type && r.status === "pending");

    if (pending) throw new Error("ALREADY_HAS_PENDING_REQUEST");

    return this.roleRequestsRepo.create({
>>>>>>> origin/main
      businessName,
      details,
      type,
      userId,
    });
  }
}

<<<<<<< HEAD
export const roleRequestsService = new RoleRequestsService();
=======
export const roleRequestsService = new RoleRequestsService(
  roleRequestsRepository,
  usersRepository,
  emailService
);
>>>>>>> origin/main
