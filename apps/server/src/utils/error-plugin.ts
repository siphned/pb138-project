import { AppError } from "@repo/shared";
import { Elysia, t } from "elysia";
import { logger } from "./logger";

export const errorResponse = t.Object({
  error: t.Object({
    code: t.String(),
    message: t.String(),
  }),
  success: t.Boolean({ default: false }),
});

export const errorPlugin = new Elysia().onError(({ error, set }) => {
  if (error instanceof AppError) {
    set.status = error.statusCode;
    return {
      error: {
        code: error.code ?? "UNKNOWN_ERROR",
        message: error.message,
      },
      success: false,
    };
  }

  logger.error({ err: error });

  set.status = 500;
  return {
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    },
    success: false,
  };
});
