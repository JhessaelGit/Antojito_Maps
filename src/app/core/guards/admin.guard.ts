import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs';

export const adminGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    map(user => {
      const isAdmin = localStorage.getItem('admin_id');
      if (user && isAdmin) {
        return true;
      }
      return router.createUrlTree(['/admin/login']);
    })
  );
};
