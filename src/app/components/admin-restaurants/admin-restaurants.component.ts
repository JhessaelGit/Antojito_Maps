import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-restaurants',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './admin-restaurants.html',
  styleUrls: ['./admin-restaurants.css']
})
export class AdminRestaurantsComponent {

  constructor(private router: Router) {}

  // Nota: En una app real, 'plan' vendría como un ID o slug ('none', 'monthly')
  restaurantes = [
    { nombre: 'MAMA CHICKEN', plan: 'PLAN_NONE', tiempo: 0, bloqueado: false },
    { nombre: 'ROAST AND ROLL', plan: 'PLAN_MONTHLY', tiempo: 5, bloqueado: false },
    { nombre: 'SUBWAY', plan: 'PLAN_ANNUAL', tiempo: 125, bloqueado: true },
    { nombre: 'POLLOS COPACABANA', plan: 'PLAN_NONE', tiempo: 0, bloqueado: false },
    { nombre: 'BURGER KING', plan: 'PLAN_MONTHLY', tiempo: 11, bloqueado: true },
    { nombre: 'PIZZA ELIS', plan: 'PLAN_MONTHLY', tiempo: 1, bloqueado: false }
  ];

  toggleBloqueo(r: any) {
    r.bloqueado = !r.bloqueado;
  }

  irAdmin() {
    this.router.navigate(['/admin']);
  }
}