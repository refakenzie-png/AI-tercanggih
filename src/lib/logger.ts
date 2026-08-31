export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

export type LogEntry = {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: unknown;
  error?: string;
  traceId?: string;
};

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private traceId: string = '';

  setTraceId(id: string) {
    this.traceId = id;
  }

  private log(level: LogLevel, module: string, message: string, data?: unknown, error?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
      error,
      traceId: this.traceId,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const prefix = `[${level.toUpperCase()}] [${module}]`;
    const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;

    consoleMethod(prefix, message, data || '');

    if (typeof window !== 'undefined') {
      this.sendToAnalytics(entry);
    }
  }

  info(module: string, message: string, data?: unknown) {
    this.log('info', module, message, data);
  }

  warn(module: string, message: string, data?: unknown) {
    this.log('warn', module, message, data);
  }

  error(module: string, message: string, error?: Error | string) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    this.log('error', module, message, undefined, errorMsg);
  }

  success(module: string, message: string, data?: unknown) {
    this.log('success', module, message, data);
  }

  debug(module: string, message: string, data?: unknown) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', module, message, data);
    }
  }

  getLogs(module?: string, level?: LogLevel): LogEntry[] {
    return this.logs.filter((log) => (!module || log.module === module) && (!level || log.level === level));
  }

  clearLogs() {
    this.logs = [];
  }

  private sendToAnalytics(entry: LogEntry) {
    if (entry.level === 'error' || entry.level === 'warn') {
      try {
        navigator.sendBeacon('/api/analytics/log', JSON.stringify(entry));
      } catch (e) {
        console.error('Failed to send log to analytics:', e);
      }
    }
  }
}

export const logger = new Logger();
