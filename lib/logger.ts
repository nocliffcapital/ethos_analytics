/**
 * Structured logging utility
 * Compatible with CloudWatch, Datadog, and other log aggregators
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private env: string;

  constructor() {
    this.env = process.env.NODE_ENV || "development";
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    // In production, output JSON for log aggregators
    if (this.env === "production") {
      console.log(JSON.stringify(entry));
    } else {
      // In development, use readable format
      const prefix = `[${entry.timestamp}] ${level.toUpperCase()}:`;
      console.log(prefix, message, context || "", error || "");
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log("debug", message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log("error", message, context, error);
  }
}

export const logger = new Logger();

