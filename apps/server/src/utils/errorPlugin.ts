import { AppError } from "@repo/shared";
import { Elysia } from "elysia";
import { logger } from "./logger";

export const errorPlugin = new Elysia().onError(({ error, set }) => {
  if (error instanceof AppError) {
    set.status = error.statusCode;
    return {
      error: {
        code: error.code,
        message: error.message,
      },
      success: false,
    };
  }

  logger.error(error);

  set.status = 500;
  return {
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    },
    success: false,
  };
});
