import { createClerkClient } from "@clerk/backend";
import type { RoleRequest } from "@repo/shared/schemas";
import { emailService, type IEmailService } from "../email/email.service";
import { type IUsersRepository, usersRepository } from "../users/users.repository";
import { type IRoleRequestsRepository, roleRequestsRepository } from "./role-requests.repository";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export class RoleRequestsService {
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

    const metadataKey = request.type === "winemaker" ? "is_winemaker" : "is_shop_owner";

    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: { [metadataKey]: true },
    });

    const result = await this.roleRequestsRepo.updateStatus(requestId, "approved", adminUserId);

    this.emailService
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

    return result;
  }

  async submitRequest(
    userId: string,
    type: "winemaker" | "shop_owner",
    businessName: string,
    details?: string
  ): Promise<RoleRequest> {
    const existing = await this.roleRequestsRepo.findByUserId(userId);
    const pending = existing.find((r) => r.type === type && r.status === "pending");

    if (pending) throw new Error("ALREADY_HAS_PENDING_REQUEST");

    return this.roleRequestsRepo.create({
      businessName,
      details,
      type,
      userId,
    });
  }
}

export const roleRequestsService = new RoleRequestsService(
  roleRequestsRepository,
  usersRepository,
  emailService
);
