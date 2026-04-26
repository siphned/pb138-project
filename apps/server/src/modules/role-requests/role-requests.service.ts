import { createClerkClient } from "@clerk/backend";
import type { RoleRequest } from "../../db/schema";
import { emailService } from "../email";
import { usersRepository } from "../users/users.repository";
import { roleRequestsRepository } from "./role-requests.repository";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const roleRequestsService = {
  async submitRequest(
    userId: string,
    type: "winemaker" | "shop_owner",
    businessName: string,
    details?: string
  ): Promise<RoleRequest> {
    const existing = await roleRequestsRepository.findByUserId(userId);
    const pending = existing.find((r) => r.type === type && r.status === "pending");

    if (pending) throw new Error("ALREADY_HAS_PENDING_REQUEST");

    return roleRequestsRepository.create({
      userId,
      type,
      businessName,
      details,
    });
  },

  async listPending(): Promise<RoleRequest[]> {
    return roleRequestsRepository.findPending();
  },

  async approve(requestId: string, adminUserId: string): Promise<RoleRequest> {
    const request = await roleRequestsRepository.findById(requestId);
    if (!request) throw new Error("NOT_FOUND");
    if (request.status !== "pending") throw new Error("ALREADY_RESPONDED");

    const user = await usersRepository.findById(request.userId);
    if (!user) throw new Error("USER_NOT_FOUND");

    const metadataKey = request.type === "winemaker" ? "is_winemaker" : "is_shop_owner";

    await clerkClient.users.updateUserMetadata(user.clerkId, {
      publicMetadata: { [metadataKey]: true },
    });

    const result = await roleRequestsRepository.updateStatus(requestId, "approved", adminUserId);

    emailService
      .sendRoleRequestApproved(user.email, {
        fname: user.fname,
        role: request.type,
      })
      .catch(console.error);

    return result;
  },

  async reject(requestId: string, adminUserId: string): Promise<RoleRequest> {
    const request = await roleRequestsRepository.findById(requestId);
    if (!request) throw new Error("NOT_FOUND");
    if (request.status !== "pending") throw new Error("ALREADY_RESPONDED");

    const result = await roleRequestsRepository.updateStatus(requestId, "rejected", adminUserId);

    usersRepository
      .findById(request.userId)
      .then((user) => {
        if (user) {
          emailService.sendRoleRequestRejected(user.email, {
            fname: user.fname,
            role: request.type,
          });
        }
      })
      .catch(console.error);

    return result;
  },
};
