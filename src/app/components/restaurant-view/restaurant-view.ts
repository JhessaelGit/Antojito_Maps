import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-restaurant-view',
  standalone: true,
  templateUrl: './restaurant-view.html',
  styleUrl: './restaurant-view.css'
})
export class RestaurantView implements OnInit {
  // Los mismos datos, pero sin posibilidad de modificarlos desde aquí
  promociones = [
    { id: 1, nombre: 'Combo Familiar', descripcion: '8 presas + papas + soda', precio: 85, fechaExpiracion: new Date(Date.now() + 3600000) }
  ];

  menu = [
    { id: 101, nombre: 'Hamburguesa Triple', descripcion: 'Carne a la parrilla y extra queso', precio: 35 }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    window.scrollTo(0, 0); // Siempre empezar arriba
  }

  calcularTiempoRestante(fecha: Date): string {
    const diff = new Date(fecha).getTime() - new Date().getTime();
    const horas = Math.floor(diff / (1000 * 60 * 60));
    return `${horas} horas`;
  }

  volverAlMapa() {
    this.router.navigate(['/map']);
  }
}