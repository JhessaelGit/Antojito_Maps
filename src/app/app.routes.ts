import { Routes } from '@angular/router';
import { MapPage } from './components/map-page/map-page.component';
import { RestaurantPage } from './components/restaurant-page/restaurant-page.component';
import { PaginaPrincipalComponent } from './components/principal-page/pagina-principal.component';
import { RestaurantLoginComponent } from './components/login-restaurant/restaurant-login.component';
import { RegisterRestaurantComponent } from './components/register-restaurant/register-restaurant.component';
import { PaymentOptionsComponent } from './components/payment-options/payment-options.component';
import { QrPaymentComponent } from './components/qr-payment/qr-payment.component';
import { RestaurantView } from './components/restaurant-view/restaurant-view.component';
import { AdminLogin } from './components/admin-login/admin-login';
export const routes: Routes = [
  {
    path: 'restaurant',
    component: RestaurantPage
  },
  {
    path: 'admin/login',
    component: AdminLogin
  },
  {
    path: 'restaurant/login',
    component: RestaurantLoginComponent
  },
  {
    path: 'restaurant/register',
    component: RegisterRestaurantComponent
  },
  {
    path: 'payment',
    component: PaymentOptionsComponent
  },
  {
    path: 'payment/qr',
    component: QrPaymentComponent
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
    path: 'restaurant-view', 
    component: RestaurantView 
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