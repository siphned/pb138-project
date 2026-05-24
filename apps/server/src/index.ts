<<<<<<< HEAD
import z from "zod";
import { app } from "./app";
import { logger } from "./utils/logger";

const envSchema = z.object({
  CLERK_JWT_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1).optional(),
  DATABASE_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1).optional(),
});

const envResult = envSchema.safeParse(process.env);
if (!envResult.success) {
  logger.error({ errors: envResult.error.flatten().fieldErrors }, "Missing or invalid env vars");
  process.exit(1);
}
if (!envResult.data.CLERK_WEBHOOK_SIGNING_SECRET) {
  logger.warn("CLERK_WEBHOOK_SIGNING_SECRET not set — webhook verification disabled");
}
if (!envResult.data.RESEND_API_KEY) {
  logger.warn("RESEND_API_KEY not set — emails will not be sent");
}

const port = process.env.PORT || 3000;
logger.info(`Starting server at http://localhost:${port}`);
logger.info(
  `OpenAPI spec available at http://localhost:${port}/openapi and http://localhost:${port}/swagger/json`
);
app.listen(port);
=======
import { app } from "./app";

// biome-ignore lint/suspicious/noConsole: entry point
console.log("Starting server at http://localhost:3000");
// biome-ignore lint/suspicious/noConsole: entry point
console.log("OpenAPI spec available at http://localhost:3000/swagger/json");
app.listen(3000);
>>>>>>> origin/main
