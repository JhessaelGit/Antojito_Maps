import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-options.component.html',
  styleUrls: ['./payment-options.component.css'],
})
export class PaymentOptionsComponent {

  planes = [
    {
      id: 'BASIC',
      nombre: 'Basic',
      precio: 'Gratis',
      precioNum: null,
      descripcion: 'Ideal para empezar. Aparece en el mapa con tu información esencial.',
      features: ['Perfil en el mapa', 'Hasta 2 promociones', 'Soporte básico'],
      destacado: false,
      badge: null,
      btnLabel: 'Comenzar gratis'
    },
    {
      id: 'PREMIUM',
      nombre: 'Premium',
      precio: 'Bs 99',
      precioNum: 99,
      descripcion: 'Para negocios que quieren destacar y llegar a más caseritos.',
      features: ['Todo lo de Basic', 'Promociones ilimitadas', 'Posición destacada', 'Estadísticas básicas'],
      destacado: true,
      badge: 'Más popular',
      btnLabel: 'Elegir Premium'
    },
    {
      id: 'PRO',
      nombre: 'Pro',
      precio: 'Bs 199',
      precioNum: 199,
      descripcion: 'La experiencia completa para restaurantes con alta demanda.',
      features: ['Todo lo de Premium', 'Perfil verificado ✓', 'Soporte prioritario', 'Analíticas avanzadas'],
      destacado: false,
      badge: null,
      btnLabel: 'Elegir Pro'
    }
  ];

  constructor(private router: Router) {}

  seleccionar(plan: any) {
    localStorage.setItem('selected_plan', plan.id);
    if (plan.id === 'BASIC') {
      this.router.navigate(['/restaurant']);
    } else {
      this.router.navigate(['/payment/qr'], { state: { plan: plan.id, precio: plan.precio } });
    }
  }

  volver() {
    this.router.navigate(['/restaurant/register']);
  }
}