import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RestauranteService } from '../../core/services/restaurante.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map-page.html',
  styleUrls: ['./map-page.css']
})
export class MapPage implements OnInit, AfterViewInit {

  private map!: L.Map;
  private markersLayer = L.layerGroup();
  private locationMarker?: L.Marker;

  categorias = [
    { label: 'Todas',         slug: '' },
    { label: 'Sushi',         slug: 'Sushi' },
    { label: 'Comida Típica', slug: 'Comida Tipica' },
    { label: 'Pizzería',      slug: 'Pizzeria' },
    { label: 'Salteñas',      slug: 'Salteñas' },
    { label: 'Chicharrón',    slug: 'Chicharron' },
    { label: 'Hamburguesas',  slug: 'Hamburguesas' },
    { label: 'Tacos',         slug: 'Tacos' },
    { label: 'Parrilla',      slug: 'Parrilla' },
  ];

  categoriaSeleccionada: string = '';
  textoBusqueda: string = '';
  mostrarBienvenida: boolean = true;
  sinResultados: boolean = false;
  categoriaSinResultados: string = '';
  cargando: boolean = false;
  errorApi: boolean = false;

  private restaurantes: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
    private restauranteService: RestauranteService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.categoriaSeleccionada = params['categoria'] || '';
      if (this.map) {
        this.filtrarRestaurantes();
      }
    });
  }

  ngAfterViewInit() {
    this.initMap();
    this.obtenerUbicacion();
    this.cargarRestaurantes();
  }

  private initMap() {
    this.map = L.map('map', {
      center: [-17.3935, -66.1568],
      zoom: 15,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
  }

  private obtenerUbicacion() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Icono de ubicación del usuario
        const iconoUbicacion = L.divIcon({
          className: 'user-location-marker',
          html: `
            <div class="user-pulse-ring"></div>
            <div class="user-dot"></div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        if (this.locationMarker) {
          this.locationMarker.setLatLng([lat, lng]);
        } else {
          this.locationMarker = L.marker([lat, lng], { icon: iconoUbicacion })
            .addTo(this.map);
        }

        // Centra el mapa en la ubicación del usuario
        this.map.setView([lat, lng], 15);
      },
      (err) => {
        console.warn('Geolocalización denegada o no disponible:', err.message);
        // Si no hay permiso, el mapa queda centrado en Cochabamba por defecto
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  cargarRestaurantes() {
    this.cargando = true;
    this.errorApi = false;

    const timeoutId = setTimeout(() => {
      if (this.cargando) {
        this.cargando = false;
        this.errorApi = true;
        console.warn('La API tardó demasiado. Mostrando mapa sin datos.');
      }
    }, 8000);

    this.restauranteService.getRestaurantes().subscribe({
      next: (data: any) => {
        clearTimeout(timeoutId);

        if (Array.isArray(data)) {
          this.restaurantes = data;
        } else if (data?.data && Array.isArray(data.data)) {
          this.restaurantes = data.data;
        } else if (data?.restaurantes && Array.isArray(data.restaurantes)) {
          this.restaurantes = data.restaurantes;
        } else if (data?.content && Array.isArray(data.content)) {
          this.restaurantes = data.content;
        } else {
          console.warn('Formato de respuesta inesperado:', data);
          this.restaurantes = [];
        }

        this.cargando = false;
        this.filtrarRestaurantes();
      },
      error: (err) => {
        clearTimeout(timeoutId);
        console.error('Error cargando restaurantes:', err);
        this.cargando = false;
        this.errorApi = true;
      }
    });
  }

  filtrarRestaurantes() {
    this.markersLayer.clearLayers();

    const filtrados = this.restaurantes.filter(r => {
      const matchCat = !this.categoriaSeleccionada ||
        (r.category ?? r.categoria ?? '')
          .toLowerCase() === this.categoriaSeleccionada.toLowerCase();

      const nombre = r.name ?? r.nombre ?? '';
      const matchBusqueda = !this.textoBusqueda ||
        nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase());

      return matchCat && matchBusqueda;
    });

    const catLabel = this.categorias.find(c =>
      c.slug.toLowerCase() === this.categoriaSeleccionada.toLowerCase()
    )?.label || this.categoriaSeleccionada;

    this.sinResultados = filtrados.length === 0 && !!this.categoriaSeleccionada;
    this.categoriaSinResultados = catLabel;
    this.mostrarBienvenida = filtrados.length === 0 && !this.categoriaSeleccionada;

    filtrados.forEach(r => {
      const lat = r.latitude ?? r.lat ?? r.latitud;
      const lng = r.longitude ?? r.lng ?? r.longitud;
      if (!lat || !lng) return;

      const icono = L.divIcon({
        className: 'custom-restaurant-marker',
        html: `<div class="marker-pin"><div class="marker-inner"></div></div>`,
        iconSize: [28, 36],
        iconAnchor: [14, 36]
      });

      const nombre = r.name ?? r.nombre ?? 'Restaurante';
      const descripcion = r.description ?? r.descripcion ?? (r.category ?? r.categoria ?? '');

      const marker = L.marker([lat, lng], { icon: icono });
      marker.bindPopup(`
        <div style="font-family:'Inter',sans-serif; min-width:160px;">
          <strong style="color:#02332D; font-size:14px;">${nombre}</strong><br>
          <small style="color:#888;">${descripcion}</small>
        </div>
      `);

      marker.on('click', () => {
        this.ngZone.run(() => {
          this.router.navigate(['/restaurant', r.uuid ?? r.id]);
        });
      });

      this.markersLayer.addLayer(marker);
    });
  }

  buscarRestaurante(texto: string) {
    this.textoBusqueda = texto;
    this.filtrarRestaurantes();
  }

  seleccionarCategoria(slug: string) {
    this.categoriaSeleccionada = slug;
    this.router.navigate([], {
      queryParams: { categoria: slug || null },
      queryParamsHandling: 'merge'
    });
    this.filtrarRestaurantes();
  }

  verTodasLasCategorias() {
    this.seleccionarCategoria('');
  }

  volverAlInicio() {
    this.router.navigate(['/inicio']);
  }

  centrarEnMiUbicacion() {
    this.obtenerUbicacion();
  }
}