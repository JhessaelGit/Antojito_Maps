import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly apiUrl: string = `${environment.apiBaseUrl}/log`;
  private readonly sendRemoteLogs = false;

  constructor(private http: HttpClient) {}

  private sendToServer(email: string) {
    this.http.post(this.apiUrl, { email }).subscribe({
      error: err => {
        if (err?.status !== 404) {
          console.error(err);
        }
      }
    });
  }

  log(level: LogLevel, message: string, context?: any) {

    console.log({ level, message, context });

    if (this.sendRemoteLogs && context?.email) {
      this.sendToServer(context.email);
    }
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