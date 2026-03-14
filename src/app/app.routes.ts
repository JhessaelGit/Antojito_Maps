import { Routes } from '@angular/router';
import { MapPage } from './components/map-page/map-page';
import { RestaurantPage } from './components/restaurant-page/restaurant-page';
import { PaginaPrincipalComponent } from './components/PaginaPrincipal/pagina-principal.component';

export const routes: Routes = [
  {
    path: 'restaurant',
    component: RestaurantPage
  },
  {
    path: 'inicio',
    component: PaginaPrincipalComponent
  },
  {
    path: 'mapa',
    component: MapPage
  },
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'inicio'
  }
];