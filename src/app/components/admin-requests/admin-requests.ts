import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-requests.html',
  styleUrl: './admin-requests.css'
})
export class AdminRequestsComponent {

  constructor(private location: Location) {}

  volverAtras(): void {
    this.location.back();
  }

  solicitudes = [

    {
      id: 1,
      restaurante: 'Pollos Hermanos América',
      tipo: 'Promoción',
      estado: 'Pendiente',
      descripcion: 'Solicitud para aprobar descuento del 50% en combos familiares.',
      fecha: '06/05/2026'
    },

    {
      id: 2,
      restaurante: 'Pizza Centro',
      tipo: 'Reporte',
      estado: 'Pendiente',
      descripcion: 'Usuario reportó imágenes inapropiadas en promoción.',
      fecha: '06/05/2026'
    },

    {
      id: 3,
      restaurante: 'Burger Norte',
      tipo: 'Restaurante',
      estado: 'Pendiente',
      descripcion: 'Solicitud de revisión de restaurante por contenido duplicado.',
      fecha: '05/05/2026'
    }

  ];

}