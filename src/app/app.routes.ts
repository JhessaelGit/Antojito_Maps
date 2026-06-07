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

import { AdminPageComponent } from './components/admin-page/admin-page';
import { AdminRestaurantsComponent } from './components/admin-restaurants/admin-restaurants.component';
import { AdminCreate } from './components/admin-create/admin-create';
import { AdminEdit } from './components/admin-edit/admin-edit';
import { AdminDeletedComponent } from './components/admin-deleted/admin-deleted.component';

import { adminGuard } from './core/guards/admin.guard';
import { ownerGuard } from './core/guards/owner.guard';
import { ClientLoginComponent } from './components/client-login/client-login.component';
import { ClientRegisterComponent } from './components/client-register/client-register.component';

import { AdminManageComponent } from './components/admin-manage/admin-manage';
import { AdminRequestsComponent } from './components/admin-requests/admin-requests';
import { ClientProfileComponent } from './components/client-profile/client-profile';

export const routes: Routes = [

  {
    path: 'restaurant',
    component: RestaurantPage,
    canActivate: [ownerGuard]
  },

  /* ================= ADMIN ================= */

  {
    path: 'admin',
    component: AdminPageComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/login',
    component: AdminLogin
  },
  {
    path: 'admin/agregar',
    component: AdminCreate,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/editar',
    component: AdminEdit,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/eliminados',
    component: AdminDeletedComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/restaurants',
    component: AdminRestaurantsComponent,
    canActivate: [adminGuard]
  },

  {
    path: 'admin/manage',
    component: AdminManageComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/requests',
    component: AdminRequestsComponent,
    canActivate: [adminGuard]
  },

  

  /* ================= RESTAURANT ================= */

  {
    path: 'restaurant/login',
    component: RestaurantLoginComponent
  },
  {
    path: 'restaurant/register',
    component: RegisterRestaurantComponent
  },

  /* ================= CLIENT ================= */

  {
    path: 'client/login',
    component: ClientLoginComponent
  },
  {
    path: 'client/register',
    component: ClientRegisterComponent
  },

  /* ================= PAYMENT ================= */

  {
    path: 'payment',
    component: PaymentOptionsComponent
  },
  {
    path: 'payment/qr',
    component: QrPaymentComponent
  },

  /* ================= GENERAL ================= */

  {
    path: 'inicio',
    component: PaginaPrincipalComponent
  },
  {
    path: 'mapa',
    component: MapPage
  },
  { 
    path: 'restaurant-view/:uuid', 
    component: RestaurantView 
  },
  {
    path: 'perfil-cliente',
    component: ClientProfileComponent
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