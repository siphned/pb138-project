import { createClerkClient } from "@clerk/backend";
import type { RoleRequest } from "../../db/schema";
import { usersRepository } from "../users/users.repository";
import { roleRequestsRepository } from "./role-requests.repository";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const roleRequestsService = {
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

    return roleRequestsRepository.updateStatus(requestId, "approved", adminUserId);
  },

  listPending(): Promise<RoleRequest[]> {
    return roleRequestsRepository.findPending();
  },

  async reject(requestId: string, adminUserId: string): Promise<RoleRequest> {
    const request = await roleRequestsRepository.findById(requestId);
    if (!request) throw new Error("NOT_FOUND");
    if (request.status !== "pending") throw new Error("ALREADY_RESPONDED");

    return roleRequestsRepository.updateStatus(requestId, "rejected", adminUserId);
  },
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
      businessName,
      details,
      type,
      userId,
    });
  },
};
