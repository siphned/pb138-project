export type LogLevel = "error" | "warn" | "info" | "debug";

export interface LogContext {
  userId?: string;
  operation?: string;
  timestamp?: string;
  [key: string]: unknown;
}

function getConsoleMethod(level: LogLevel): "error" | "warn" | "log" {
  if (level === "error") return "error";
  if (level === "warn") return "warn";
  return "log";
}

function log(
  level: LogLevel,
  message: string,
  error?: Error | unknown,
  context?: LogContext
): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${JSON.stringify(context)}]` : "";
  const errorStr = error ? ` - ${error instanceof Error ? error.message : String(error)}` : "";

  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}${errorStr}`;

  // biome-ignore lint/suspicious/noConsole: logging utility
  console[getConsoleMethod(level)](logMessage);

  if (error instanceof Error && error.stack) {
    // biome-ignore lint/suspicious/noConsole: logging utility
    console.error("Stack trace:", error.stack);
  }
}

export const Logger = {
  debug: (message: string, context?: LogContext): void => {
    log("debug", message, undefined, context);
  },
  error: (message: string, error?: Error | unknown, context?: LogContext): void => {
    log("error", message, error, context);
  },
  info: (message: string, context?: LogContext): void => {
    log("info", message, undefined, context);
  },
  log,
  warn: (message: string, error?: Error | unknown, context?: LogContext): void => {
    log("warn", message, error, context);
  },
};
