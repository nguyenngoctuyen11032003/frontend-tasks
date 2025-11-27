// Error logging utility
export interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  context?: Record<string, unknown>;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100;

  log(error: Error, context?: Record<string, unknown>) {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      context,
    };

    this.logs.push(errorLog);

    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error logged:", errorLog);
    }

    // Send to error reporting service in production
    if (process.env.NODE_ENV === "production") {
      this.sendToErrorService(errorLog);
    }
  }

  private sendToErrorService(errorLog: ErrorLog) {
    // TODO: Implement integration with error reporting service
    // Examples: Sentry, LogRocket, Rollbar, etc.
    // 
    // if (window.Sentry) {
    //   window.Sentry.captureException(new Error(errorLog.message), {
    //     extra: errorLog.context,
    //     tags: {
    //       timestamp: errorLog.timestamp,
    //     },
    //   });
    // }
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const errorLogger = new ErrorLogger();

// Helper function to log errors
export function logError(error: Error, context?: Record<string, unknown>) {
  errorLogger.log(error, context);
}
