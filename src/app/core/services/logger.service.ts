import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private apiUrl: string = 'https://antogitomapsbackend-production.up.railway.app/log';
  
  //private apiUrl: string = 'http://localhost:8080/log';

  constructor(private http: HttpClient) {}

  private sendToServer(email: string) {
    this.http.post(this.apiUrl, { email }).subscribe({
      error: err => console.error(err)
    });
  }

  log(level: LogLevel, message: string, context?: any) {

    console.log({ level, message, context });

    if (context?.email) {
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