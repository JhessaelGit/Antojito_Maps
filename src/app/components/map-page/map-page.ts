import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Importar el Router
import * as L from 'leaflet';

// Definimos una interfaz para nuestros restaurantes (buena práctica en TypeScript)
interface Restaurante {
  id: number;
  nombre: string;
  lat: number;
  lng: number;
  imagenUrl: string;
}

@Component({
  selector: 'app-map-page',
  standalone: true,
  templateUrl: './map-page.html',
  styleUrl: './map-page.css'
})
export class MapPage implements OnInit {
  private map: any;

  // Lista simulada de restaurantes con coordenadas aproximadas en Cochabamba
  restaurantes: Restaurante[] = [
    {
      id: 1,
      nombre: 'Restaurante Roast and Roll',
      lat: -17.3750,
      lng: -66.1750,
      imagenUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBsD1bnJ43i_yrQuttL76UT8ZLfd8MzEv6NA&s'
    },
    {
      id: 2,
      nombre: 'Restaurante Burguer King',
      lat: -17.3780,
      lng: -66.1600,
      imagenUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZG1Qt7KgIdeFY4shNxs8E759ll6Atl8_Buw&s'
    },
    {
      id: 3,
      nombre: 'Restaurante Panchita',
      lat: -17.3900,
      lng: -66.1850,
      imagenUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnaUmFu-0nxYbSGEyI2HiYTpl7w1Z_G02K0g&s'
    },
    {
      id: 4,
      nombre: 'Restaurante Mama Chicken',
      lat: -17.3950,
      lng: -66.1650,
      imagenUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjq5adI4MgaR-P-a1xyuNq9JPTVuk2gtXBsA&s'
    },
    {
      id: 5,
      nombre: 'Restaurante Elis Pizza',
      lat: -17.3900,
      lng: -66.1200,
      imagenUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2rPgEPzNYRjTLj1GcMhGOBVkNSOC8yQNyGQ&s'
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
      // Crear un icono personalizado con la imagen del restaurante
      const customIcon = L.icon({
        iconUrl: restaurante.imagenUrl,
        iconSize: [60, 60], 
        iconAnchor: [30, 30], 
        popupAnchor: [0, -30], 
        className: 'custom-restaurant-marker' 
      });

      const marker = L.marker([restaurante.lat, restaurante.lng], { icon: customIcon })
        .addTo(this.map);

      marker.bindTooltip(restaurante.nombre);

      marker.on('click', () => {
        this.irADetalleRestaurante();
      });
    });
  }

  // Función para navegar a la otra página
  private irADetalleRestaurante(): void {
    
    this.router.navigate(['/restaurant']); 
  }
}