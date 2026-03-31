import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-restaurant-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurant-view.html',
  styleUrl: './restaurant-view.css'
})
export class RestaurantView implements OnInit {
  promociones = [
    { id: 1, nombre: 'Combo Económico', descripcion: '2 presas + papas + arroz', precio: 25, fechaExpiracion: new Date(Date.now() + 7200000) }
  ];

  menu = [
    { id: 101, nombre: 'Cuarto de Pollo', descripcion: 'Pierna o entrepierna con guarniciones', precio: 28 },
    { id: 102, nombre: 'Medio Pollo', descripcion: '2 presas grandes con guarniciones', precio: 50 }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
  }

  calcularTiempoRestante(fecha: Date): string {
    const diff = new Date(fecha).getTime() - new Date().getTime();
    const horas = Math.floor(diff / (1000 * 60 * 60));
    return horas > 0 ? `${horas}h` : 'Poco tiempo';
  }

volverAlMapa() {
    this.router.navigate(['/mapa']); 
  }

}