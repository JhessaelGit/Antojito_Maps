import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './map-page.html',
  styleUrl: './map-page.css'
})
export class MapPage implements OnInit {

  private map: any;
  mostrarBienvenida: boolean = true; // Variable para el temporizador

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

  constructor(private router: Router, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initMap();
    this.agregarMarcadores();
    this.configurarGeolocalizacion();
    this.iniciarTemporizadorBienvenida();
  }

  private initMap(): void {
    this.map = L.map('map').setView([-17.3895, -66.1568], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private iniciarTemporizadorBienvenida(): void {
    setTimeout(() => {
      this.mostrarBienvenida = false;
      this.cd.detectChanges(); 
      console.log('Variable cambiada a false y vista actualizada');
    }, 5000);
  }

  private configurarGeolocalizacion(): void {
    this.map.locate({ setView: true, maxZoom: 16 });

    const iconoUsuario = L.divIcon({
      className: 'user-location-icon',
      html: '<div style="background-color: #007bff; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>',
      iconSize: [15, 15],
      iconAnchor: [7.5, 7.5]
    });

    this.map.on('locationfound', (e: any) => {
      const radius = e.accuracy / 2;
      
      L.marker(e.latlng, { icon: iconoUsuario }).addTo(this.map);
        
      L.circle(e.latlng, radius).addTo(this.map);
    });

    this.map.on('locationerror', () => {
      console.log("Acceso a ubicación denegado o no disponible.");
    });
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