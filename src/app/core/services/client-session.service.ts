import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ClientSession {
  clientId: string;
  mail: string;
  fullName: string;
  phone: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientSessionService {
  private readonly storageKey = 'client_session';
  private readonly sessionSubject = new BehaviorSubject<ClientSession | null>(this.readFromStorage());

  readonly session$ = this.sessionSubject.asObservable();

  setSession(session: ClientSession): void {
    localStorage.setItem(this.storageKey, JSON.stringify(session));
    this.sessionSubject.next(session);
  }

  clearSession(): void {
    localStorage.removeItem(this.storageKey);
    this.sessionSubject.next(null);
  }

  getSession(): ClientSession | null {
    return this.sessionSubject.value;
  }

  getClientId(): string | null {
    return this.sessionSubject.value?.clientId ?? null;
  }

  isAuthenticated(): boolean {
    return !!this.getClientId();
  }

  private readFromStorage(): ClientSession | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as ClientSession;
      if (!parsed?.clientId || !parsed?.mail) return null;
      return parsed;
    } catch {
      return null;
    }
  }
}
