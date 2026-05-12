import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminSessionService } from '../services/admin-session.service';

export const adminGuard = () => {
  const router = inject(Router);
  const adminSession = inject(AdminSessionService);

  if (adminSession.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/admin/login']);
};
