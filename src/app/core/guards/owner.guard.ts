import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const ownerGuard = () => {
  const router = inject(Router);

  // La sesión del owner se almacena en localStorage tras el login
  const ownerId = localStorage.getItem('owner_id');
  const restaurantIds = localStorage.getItem('restaurant_ids');

  if (ownerId && restaurantIds) {
    return true;
  }
  return router.createUrlTree(['/restaurant/login']);
};
