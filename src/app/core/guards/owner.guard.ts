import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs';

export const ownerGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(
    take(1),
    map(user => {
      // Verifica si el usuario de Firebase está autenticado y si tenemos datos en localStorage
      const isOwner = localStorage.getItem('owner_id') || localStorage.getItem('restaurant_ids');
      if (user && isOwner) {
        return true;
      }
      // Si no, lo mandamos al login de restaurante
      return router.createUrlTree(['/restaurant/login']);
    })
  );
};
