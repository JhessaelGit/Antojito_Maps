import { Routes } from '@angular/router';
import { MapPage } from './components/map-page/map-page';
import { RestaurantPage } from './components/restaurant-page/restaurant-page';
import { PaginaPrincipalComponent } from './components/PaginaPrincipal/pagina-principal.component';
import { RestaurantLoginComponent } from './components/login-restaurant/restaurant-login.component';
import { RegisterRestaurantComponent } from './components/register-restaurant/register-restaurant.component';
export const routes: Routes = [
  {
    path: 'restaurant',
    component: RestaurantPage
  },
  {
    path: 'restaurant/login',
    component: RestaurantLoginComponent
  },
  {
    path: 'inicio',
    component: PaginaPrincipalComponent
  },
  {
    path: 'restaurant/register',
    component: RegisterRestaurantComponent
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