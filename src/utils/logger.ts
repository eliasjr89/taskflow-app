// src/utils/logger.ts

type LogLevel = "debug" | "info" | "warn" | "error";

const IS_DEV = import.meta.env.DEV;

const COLORS = {
  debug: "color: #7f8c8d; font-weight: bold;",
  info: "color: #3498db; font-weight: bold;",
  warn: "color: #f39c12; font-weight: bold;",
  error: "color: #e74c3c; font-weight: bold;",
};

const formatMessage = (level: LogLevel, message: string, ...args: any[]) => {
  const timestamp = new Date().toLocaleTimeString();
  const label = `[TaskFlow] ${timestamp} [${level.toUpperCase()}]`;

  if (IS_DEV) {
    // eslint-disable-next-line no-console
    console.log(
      `%c${label}: %c${message}`,
      COLORS[level],
      "color: inherit;",
      ...args,
    );
  } else if (level === "error" || level === "warn") {
    // En producción solo logueamos errores y advertencias de forma simple
    const method = level === "error" ? "error" : "warn";
    // eslint-disable-next-line no-console
    console[method](`${label}: ${message}`, ...args);
  }
};

export const logger = {
  debug: (message: string, ...args: any[]) =>
    formatMessage("debug", message, ...args),
  info: (message: string, ...args: any[]) =>
    formatMessage("info", message, ...args),
  warn: (message: string, ...args: any[]) =>
    formatMessage("warn", message, ...args),
  error: (message: string, ...args: any[]) =>
    formatMessage("error", message, ...args),
};
