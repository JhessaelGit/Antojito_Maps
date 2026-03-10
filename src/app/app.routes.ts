import { Routes } from '@angular/router';
import { MapPage } from './components/map-page/map-page';
import { RestaurantPage } from './components/restaurant-page/restaurant-page';
export const routes: Routes = [
  {
    path: 'mapa',
    component: MapPage
  },
  {
    path: '',
    redirectTo: 'mapa',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'mapa' // Por si el usuario escribe cualquier cosa en la URL
  }
];