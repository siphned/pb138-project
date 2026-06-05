import { z } from "zod";

export const submitRoleRequestBody = z.object({
  businessName: z.string().min(1),
  details: z.string().optional(),
});

export const roleRequestResponse = z.object({
  businessName: z.string(),
  details: z.string().nullable().optional(),
  id: z.string(),
  requestedRole: z.enum(["winemaker", "shop_owner"]),
  status: z.enum(["pending", "approved", "rejected"]),
  submittedAt: z.date(),
  userId: z.string(),
});
