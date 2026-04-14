import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminSessionService } from '../services/admin-session.service';

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export const apiAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const adminSession = inject(AdminSessionService);

  const apiBaseUrl = normalizeBaseUrl(environment.apiBaseUrl);
  const isApiRequest = req.url.startsWith(apiBaseUrl) || req.url.startsWith('/api');
  const isAdminRequest = isApiRequest && req.url.includes('/admin/');
  const isAdminLogin = isAdminRequest && req.url.includes('/admin/login');
  const isAdminCreate = isAdminRequest && req.url.includes('/admin/create');
  const adminId = adminSession.getAdminId();
  const shouldSetJsonContentType = ['POST', 'PUT', 'PATCH'].includes(req.method);

  let request = req;

  // Solo establecer Content-Type en requests con body JSON para evitar preflight innecesario en GET.
  if (isApiRequest && shouldSetJsonContentType && !(request.body instanceof FormData) && !request.headers.has('Content-Type')) {
    request = request.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Endpoints protegidos admin: todos excepto login y create en modo bootstrap (sin sesión).
  const shouldAttachAdminHeader = isAdminRequest && !isAdminLogin && (!isAdminCreate || !!adminId);
  if (shouldAttachAdminHeader && adminId) {
    request = request.clone({
      setHeaders: {
        'X-Admin-Id': adminId
      }
    });
  }

  const shouldHandleUnauthorized = isAdminRequest && !isAdminLogin && (!isAdminCreate || !!adminId);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (shouldHandleUnauthorized && error.status === 401) {
        adminSession.clearSession();
        router.navigate(['/admin/login']);
      }

      return throwError(() => error);
    })
  );
};
