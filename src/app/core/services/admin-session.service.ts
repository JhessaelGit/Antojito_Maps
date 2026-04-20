import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AdminSession {
  adminId: string;
  mail: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminSessionService {
  private readonly storageKey = 'admin_session';
  private readonly sessionSubject = new BehaviorSubject<AdminSession | null>(this.readFromStorage());

  readonly session$ = this.sessionSubject.asObservable();

  setSession(session: AdminSession): void {
    sessionStorage.setItem(this.storageKey, JSON.stringify(session));
    this.sessionSubject.next(session);
  }

  clearSession(): void {
    sessionStorage.removeItem(this.storageKey);
    this.sessionSubject.next(null);
  }

  getSession(): AdminSession | null {
    return this.sessionSubject.value;
  }

  getAdminId(): string | null {
    return this.sessionSubject.value?.adminId ?? null;
  }

  getMail(): string | null {
    return this.sessionSubject.value?.mail ?? null;
  }

  isAuthenticated(): boolean {
    return !!this.getAdminId();
  }

  private readFromStorage(): AdminSession | null {
    const raw = sessionStorage.getItem(this.storageKey);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as AdminSession & { id?: string; uuid?: string };
      const resolvedAdminId = parsed?.adminId ?? parsed?.id ?? parsed?.uuid;
      if (!resolvedAdminId || !parsed?.mail) return null;

      return {
        adminId: resolvedAdminId,
        mail: parsed.mail
      };
    } catch {
      return null;
    }
  }
}
