import { z } from "zod";
import { app } from "./app";
import { logger } from "./utils/logger";

const envSchema = z.object({
  CLERK_JWT_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1),
  DATABASE_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1),
});

const envResult = envSchema.safeParse(process.env);
if (!envResult.success) {
  logger.error({ errors: envResult.error.flatten().fieldErrors }, "Missing or invalid env vars");
  process.exit(1);
}

const port = process.env.PORT || 3000;
logger.info(`Starting server at http://localhost:${port}`);
logger.info(`OpenAPI spec available at http://localhost:${port}/swagger/json`);
app.listen(port);
