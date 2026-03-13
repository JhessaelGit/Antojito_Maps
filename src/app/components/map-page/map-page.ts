import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/assets/marker-icon-2x-red.png',
  iconUrl: '/assets/marker-icon-red.png',
  shadowUrl: '/assets/marker-shadow.png'
});

interface Restaurante {
  id: number;
  nombre: string;
  lat: number;
  lng: number;
  descripcion: string;
}

@Component({
  selector: 'app-map-page',
  standalone: true,
  templateUrl: './map-page.html',
  styleUrl: './map-page.css'
})
export class MapPage implements OnInit {

  private map: any;

  restaurantes: Restaurante[] = [
    {
      id: 1,
      nombre: 'Pollos Panchita',
      lat: -17.3895,
      lng: -66.1568,
      descripcion: 'Pollo frito y combos familiares'
    },
    {
      id: 2,
      nombre: 'Burger House',
      lat: -17.3950,
      lng: -66.1600,
      descripcion: 'Hamburguesas artesanales'
    },
    {
      id: 3,
      nombre: 'Pizza Loca',
      lat: -17.3920,
      lng: -66.1500,
      descripcion: 'Pizzas con promociones'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initMap();
    this.agregarMarcadores();
  }

  private initMap(): void {

    this.map = L.map('map').setView([-17.3895, -66.1568], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

  }

  private agregarMarcadores(): void {

    this.restaurantes.forEach(restaurante => {

      const marker = L.marker([restaurante.lat, restaurante.lng])
        .addTo(this.map);

      marker.bindPopup(`
        <div style="text-align:center; width:200px">

          <img src="/assets/logo-panchita.png"
               style="width:80px; margin-bottom:8px; border-radius:8px">

          <h3 style="margin:5px 0">${restaurante.nombre}</h3>

          <p style="font-size:14px; margin:0 0 10px 0">
            ${restaurante.descripcion}
          </p>

          <button
            style="
              background:#7F1100;
              color:white;
              padding:6px 12px;
              border-radius:6px;
              border:none;
              cursor:pointer
            "
            onclick="window.location.href='/restaurant'"
          >
            Ver restaurante
          </button>

        </div>
      `);

    });

  }

}