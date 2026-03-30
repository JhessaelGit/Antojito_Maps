import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  categoria: string;
}

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map-page.html',
  styleUrl: './map-page.css'
})
export class MapPage implements OnInit {

  private map: any;
  mostrarBienvenida: boolean = true;
  categoriaSeleccionada: string = '';
  restaurantesFiltrados: Restaurante[] = [];
  markersLayer: any;
  
  //DICCIONARIO DE MARCADORES
  private markersMap: Map<number, L.Marker> = new Map(); 

  restaurantes: Restaurante[] = [
  {
    id: 1,
    nombre: 'Pollos Panchita',
    lat: -17.3895,
    lng: -66.1568,
    descripcion: 'Pollo frito y combos familiares',
    categoria: 'pollo frito' 
  },
  {
    id: 2,
    nombre: 'Burger House',
    lat: -17.3950,
    lng: -66.1600,
    descripcion: 'Hamburguesas artesanales',
    categoria: 'comida rapida'
  },
  {
    id: 3,
    nombre: 'Pizza Loca',
    lat: -17.3920,
    lng: -66.1500,
    descripcion: 'Pizzas con promociones',
    categoria: 'italiana'
  }
];

  constructor(private router: Router, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initMap();

    this.markersLayer = L.layerGroup().addTo(this.map); 
    this.restaurantesFiltrados = this.restaurantes;

    this.agregarMarcadores();
  }

  buscarRestaurante(termino: string): void {
    if (!termino.trim()) return;

    const res = this.restaurantes.find(r => 
      r.nombre.toLowerCase().includes(termino.toLowerCase())
    );

    if (res) {
      this.map.flyTo([res.lat, res.lng], 17, {
        animate: true,
        duration: 1.5
      });

      const marker = this.markersMap.get(res.id);
      if (marker) {
        marker.openPopup(); 
      }
    } else {
      alert('Restaurante no encontrado.');
    }
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
      console.log("Ubicación no disponible.");
    });
  }

private agregarMarcadores(): void {
  this.markersLayer.clearLayers(); 
  this.markersMap.clear();

  this.restaurantesFiltrados.forEach(restaurante => {
    const marker = L.marker([restaurante.lat, restaurante.lng]);

    const popupContent = `
      <div style="text-align: center; font-family: 'Poppins', sans-serif;">
        <b style="color: #02332D; font-size: 1.1rem;">${restaurante.nombre}</b><br>
        <p style="margin: 5px 0; font-size: 0.9rem;">${restaurante.descripcion}</p>
        <button id="btn-view-${restaurante.id}" 
                style="background: #BF9861; color: white; border: none; 
                       padding: 8px 12px; border-radius: 5px; cursor: pointer;
                       font-weight: bold; margin-top: 5px; width: 100%;">
          Ver Menú y Ofertas
        </button>
      </div>
    `;

    marker.bindPopup(popupContent);
    
    marker.on('popupopen', () => {
      const btn = document.getElementById(`btn-view-${restaurante.id}`);
      if (btn) {
        btn.addEventListener('click', () => {
          this.router.navigate(['/restaurant-view']);
        });
      }
    });

    marker.addTo(this.markersLayer);
    this.markersMap.set(restaurante.id, marker);
  });
}

  filtrarRestaurantes(): void {

  if (this.categoriaSeleccionada === '') {
    this.restaurantesFiltrados = this.restaurantes;
  } else {
    this.restaurantesFiltrados = this.restaurantes.filter(r =>
      r.categoria === this.categoriaSeleccionada
    );
  }

  this.agregarMarcadores(); 
}
}