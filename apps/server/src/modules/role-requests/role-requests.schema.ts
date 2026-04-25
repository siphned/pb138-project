import { t } from "elysia";

export const submitRoleRequestBody = t.Object({
  businessName: t.String({ minLength: 1 }),
  details: t.Optional(t.String()),
});

export const roleRequestResponse = t.Object({
  id: t.String(),
  userId: t.String(),
  requestedRole: t.Union([t.Literal("winemaker"), t.Literal("shop_owner")]),
  status: t.Union([t.Literal("pending"), t.Literal("approved"), t.Literal("rejected")]),
  businessName: t.String(),
  details: t.Optional(t.Nullable(t.String())),
  submittedAt: t.Date(),
});
