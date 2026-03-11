import { Routes } from '@angular/router';
import { MapPage } from './components/map-page/map-page';
import { PaginaPrincipalComponent } from './components/PaginaPrincipal/pagina-principal.component';
export const routes: Routes = [
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
    redirectTo: 'inicio' // Por si el usuario escribe cualquier cosa en la URL
  }

];