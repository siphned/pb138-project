import { verifyToken } from "@clerk/backend";
import { logger } from "../../utils/logger";

export type AppRole = "customer" | "winemaker" | "shop_owner" | "admin";

export type ClerkPayload = Awaited<ReturnType<typeof verifyToken>> & {
  roles?: AppRole[];
};

export async function verifyClerkToken(
  authHeader: string | undefined
): Promise<ClerkPayload | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const CLERK_JWT_KEY = process.env.CLERK_JWT_KEY;
  const FRONTEND_URL = process.env.FRONTEND_URL;

  if (!CLERK_JWT_KEY) throw new Error("Missing env var: CLERK_JWT_KEY");
  if (!FRONTEND_URL) throw new Error("Missing env var: FRONTEND_URL");

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token, {
      authorizedParties: [FRONTEND_URL],
      jwtKey: CLERK_JWT_KEY,
    });
    return payload as ClerkPayload;
  } catch (error) {
    logger.error(
      { err: error, operation: "verifyClerkToken", tokenPrefix: token.slice(0, 20) },
      "JWT token verification failed"
    );
    return null;
  }
}
