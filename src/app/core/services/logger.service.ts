import { Injectable } from '@angular/core';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: any;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  log(level: LogLevel, message: string, context?: any) {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context
    };

    // 🔹 Salida actual (console)
    switch (level) {
      case 'INFO':
        console.log(logEntry);
        break;
      case 'WARN':
        console.warn(logEntry);
        break;
      case 'ERROR':
        console.error(logEntry);
        break;
    }

    // 🔹 FUTURO: aquí puedes enviar al backend
    // this.sendToServer(logEntry);
  }

  info(message: string, context?: any) {
    this.log('INFO', message, context);
  }

  warn(message: string, context?: any) {
    this.log('WARN', message, context);
  }

  error(message: string, context?: any) {
    this.log('ERROR', message, context);
  }
}