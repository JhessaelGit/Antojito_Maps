import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminSessionService } from '../../core/services/admin-session.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-deleted',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './admin-deleted.html',
  styleUrls: ['./admin-deleted.css']
})
export class AdminDeletedComponent implements OnInit, OnDestroy {

  adminsEliminados: Array<{ id: string; mail: string; deletedAt: string | null }> = [];
  cargando = false;
  errorMsg = '';
  private deletedAdminsRequest: XMLHttpRequest | null = null;
  private requestTimeoutId: number | null = null;
  private destroyed = false;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private adminSession: AdminSessionService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarEliminados();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.cleanupRequest();
  }

  cargarEliminados(): void {
    this.cleanupRequest();
    this.cargando = true;
    this.errorMsg = '';

    const xhr = new XMLHttpRequest();
    this.deletedAdminsRequest = xhr;
    const adminId = this.adminSession.getAdminId();
    const requestUrl = `${environment.apiBaseUrl}/admin/deleted`;
    let resolved = false;

    const finishWithData = (payload: unknown): void => {
      if (resolved) return;
      resolved = true;
      this.updateViewState(() => {
        const rawList = this.extractList(payload);
        this.adminsEliminados = this.normalizeAdmins(rawList);
        this.cargando = false;
      });
      this.clearRequestTimer();
      this.detachRequestHandlers(xhr);
      this.deletedAdminsRequest = null;
    };

    const finishWithError = (message: string): void => {
      if (resolved) return;
      resolved = true;
      this.updateViewState(() => {
        this.errorMsg = message;
        this.cargando = false;
      });
      this.clearRequestTimer();
      this.detachRequestHandlers(xhr);
      this.deletedAdminsRequest = null;
    };

    xhr.onreadystatechange = () => {
      if (resolved) return;

      // Algunos backends envian el JSON completo y dejan la conexion abierta.
      // Si el payload ya es parseable en readyState 3, lo consumimos sin esperar cierre.
      if (xhr.readyState >= XMLHttpRequest.LOADING) {
        const parsedPayload = this.tryParseJsonPayload(xhr.responseText ?? '');
        if (parsedPayload !== null) {
          finishWithData(parsedPayload);
          xhr.abort();
          return;
        }
      }

      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status >= 200 && xhr.status < 300) {
          const parsedPayload = this.tryParseJsonPayload(xhr.responseText ?? '');
          if (parsedPayload !== null) {
            finishWithData(parsedPayload);
          } else {
            finishWithData([]);
          }
        } else {
          finishWithError(this.translate.instant('ADMIN_DELETED.SUBTITLE'));
        }
      }
    };

    xhr.onerror = () => {
      finishWithError(this.translate.instant('ADMIN_DELETED.SUBTITLE'));
    };

    xhr.open('GET', requestUrl, true);
    xhr.setRequestHeader('Accept', 'application/json');
    if (adminId) {
      xhr.setRequestHeader('X-Admin-Id', adminId);
    }
    xhr.send();

    this.requestTimeoutId = window.setTimeout(() => {
      finishWithError('La consulta tardó demasiado. Intenta nuevamente.');
      xhr.abort();
    }, 15000);
  }

  volver() {
    this.router.navigate(['/admin']);
  }

  private extractList(items: unknown): any[] {
    if (Array.isArray(items)) {
      return items;
    }

    if (!items || typeof items !== 'object') {
      return [];
    }

    const payload = items as Record<string, any>;
    const directCandidates = [
      payload['data'],
      payload['admins'],
      payload['deletedAdmins'],
      payload['items'],
      payload['content'],
      payload['results'],
      payload['rows']
    ];

    for (const candidate of directCandidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }

    if (payload['data'] && typeof payload['data'] === 'object') {
      const nested = payload['data'] as Record<string, any>;
      const nestedCandidates = [
        nested['admins'],
        nested['deletedAdmins'],
        nested['items'],
        nested['content'],
        nested['results'],
        nested['rows']
      ];

      for (const candidate of nestedCandidates) {
        if (Array.isArray(candidate)) {
          return candidate;
        }
      }

      const firstNestedArray = Object.values(nested).find(Array.isArray);
      if (Array.isArray(firstNestedArray)) {
        return firstNestedArray;
      }
    }

    const firstArray = Object.values(payload).find(Array.isArray);
    return Array.isArray(firstArray) ? firstArray : [];
  }

  private tryParseJsonPayload(raw: string): unknown | null {
    const trimmed = raw.trim();
    if (!trimmed) {
      return null;
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      return null;
    }
  }

  private normalizeAdmins(rawList: any[]): Array<{ id: string; mail: string; deletedAt: string | null }> {
    return (rawList ?? [])
      .map((a: any) => {
        const deletedFlag = this.parseBoolean(a?.isDeleted ?? a?.is_deleted);
        return {
          id: `${a?.adminId ?? a?.id ?? a?.uuid ?? ''}`,
          mail: `${a?.mail ?? a?.email ?? a?.adminMail ?? a?.admin_email ?? ''}`,
          deletedAt: a?.deletedAt ?? a?.deleted_at ?? null,
          isDeleted: deletedFlag
        };
      })
      .filter((a: { isDeleted: boolean | undefined }) => a.isDeleted === undefined || a.isDeleted === true)
      .map(({ id, mail, deletedAt }: { id: string; mail: string; deletedAt: string | null; isDeleted: boolean | undefined }) => ({
        id,
        mail,
        deletedAt
      }))
      .filter((a: { id: string }) => !!a.id);
  }

  private parseBoolean(value: unknown): boolean | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value === 1;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'si'].includes(normalized)) {
        return true;
      }
      if (['false', '0', 'no'].includes(normalized)) {
        return false;
      }
    }

    return undefined;
  }

  private detachRequestHandlers(xhr: XMLHttpRequest): void {
    xhr.onreadystatechange = null;
    xhr.onerror = null;
  }

  private clearRequestTimer(): void {
    if (this.requestTimeoutId === null) {
      return;
    }

    clearTimeout(this.requestTimeoutId);
    this.requestTimeoutId = null;
  }

  private cleanupRequest(): void {
    this.clearRequestTimer();

    if (!this.deletedAdminsRequest) {
      return;
    }

    this.detachRequestHandlers(this.deletedAdminsRequest);
    this.deletedAdminsRequest.abort();
    this.deletedAdminsRequest = null;
  }

  private updateViewState(updater: () => void): void {
    if (this.destroyed) {
      return;
    }

    this.zone.run(() => {
      updater();
      this.cdr.detectChanges();
    });
  }
}