import { MapPageComponent } from './components/map-page/map-page.component';

export const routes: Routes = [
  { path: 'mapa', component: MapPageComponent },
  { path: '', redirectTo: '/mapa', pathMatch: 'full' } // Redirige la raíz al mapa
];