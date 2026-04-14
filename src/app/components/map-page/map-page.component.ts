import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RestauranteService } from '../../core/services/restaurante.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, finalize, takeUntil, timeout } from 'rxjs';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './map-page.html',
  styleUrls: ['./map-page.css']
})
export class MapPage implements OnInit, AfterViewInit, OnDestroy {

  private map!: L.Map;
  private markersLayer = L.layerGroup();
  private locationMarker?: L.Marker;

  // Usamos las llaves del JSON para las etiquetas
  categorias = [
    { label: 'CATEGORIES.ALL',      slug: '' },
    { label: 'CATEGORIES.SALTEÑAS', slug: 'Salteñas' },
    { label: 'CATEGORIES.CHICHARRON', slug: 'Chicharron' },
    { label: 'CATEGORIES.SUSHI',    slug: 'Sushi' },
    { label: 'CATEGORIES.TYPICAL',  slug: 'Comida Tipica' },
    { label: 'CATEGORIES.PIZZA',    slug: 'Pizzeria' },
    { label: 'CATEGORIES.BURGERS',  slug: 'Hamburguesas' },
    { label: 'CATEGORIES.TACOS',    slug: 'Tacos' },
    { label: 'CATEGORIES.GRILL',    slug: 'Parrilla' },
  ];

  categoriaSeleccionada: string = '';
  textoBusqueda: string = '';
  mostrarBienvenida: boolean = true;
  sinResultados: boolean = false;
  categoriaSinResultados: string = '';
  cargando: boolean = true;
  errorApi: boolean = false;

  private restaurantes: any[] = [];
  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private restauranteService: RestauranteService,
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.categoriaSeleccionada = params['categoria'] || '';
        this.filtrarRestaurantes();
        this.refreshView();
      });

    // Cargar datos en OnInit evita cambios de estado tardios en la primera deteccion.
    this.cargarRestaurantes();
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.obtenerUbicacion();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.map) this.map.remove();
  }

  private initMap(): void {
    if (this.map) this.map.remove();

    const mapContainer = L.DomUtil.get('map') as (HTMLElement & { _leaflet_id?: number }) | null;
    if (mapContainer?._leaflet_id) {
      mapContainer._leaflet_id = undefined;
    }

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

  private obtenerUbicacion(): void {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const iconoUbicacion = L.divIcon({
          className: 'user-location-marker',
          html: `<div class="user-pulse-ring"></div><div class="user-dot"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        if (this.locationMarker) {
          this.locationMarker.setLatLng([lat, lng]);
        } else {
          this.locationMarker = L.marker([lat, lng], { icon: iconoUbicacion }).addTo(this.map);
        }
        this.map.setView([lat, lng], 15);
      },
      (err) => console.warn('Geolocalización denegada:', err.message),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  cargarRestaurantes(): void {
    this.cargando = true;
    this.errorApi = false;

    this.restauranteService
      .getRestaurantes()
      .pipe(
        timeout(15000),
        takeUntil(this.destroy$),
        finalize(() => {
          this.cargando = false;
          this.refreshView();
        })
      )
      .subscribe({
        next: (data: any) => {
          if (Array.isArray(data)) this.restaurantes = data;
          else if (data?.data) this.restaurantes = data.data;
          else this.restaurantes = [];

          this.filtrarRestaurantes();
        },
        error: (err) => {
          console.error('Error:', err);
          this.errorApi = true;
          this.refreshView();
        }
      });
  }

  private refreshView(): void {
    try {
      this.cd.detectChanges();
    } catch {
      // No-op: si la vista ya fue destruida al navegar, evitamos romper flujo.
    }
  }

  filtrarRestaurantes(): void {
    this.markersLayer.clearLayers();

    const filtrados = this.restaurantes.filter(r => {
      const rCat = (r.category ?? r.categoria ?? '').toLowerCase();
      const matchCat = !this.categoriaSeleccionada || rCat === this.categoriaSeleccionada.toLowerCase();
      const nombre = (r.name ?? r.nombre ?? '').toLowerCase();
      const matchBusqueda = !this.textoBusqueda || nombre.includes(this.textoBusqueda.toLowerCase());
      return matchCat && matchBusqueda;
    });

    // Actualizar estados de UI
    const currentCat = this.categorias.find(c => c.slug.toLowerCase() === this.categoriaSeleccionada.toLowerCase());
    this.categoriaSinResultados = currentCat ? currentCat.label : this.categoriaSeleccionada;
    this.sinResultados = filtrados.length === 0 && !!this.categoriaSeleccionada;
    this.mostrarBienvenida = filtrados.length === 0 && !this.categoriaSeleccionada;

    filtrados.forEach(r => {
      const lat = r.latitude ?? r.lat ?? r.latitud;
      const lng = r.longitude ?? r.lng ?? r.longitud;
      if (lat === null || lat === undefined || lng === null || lng === undefined) return;

      const icono = L.divIcon({
        className: 'custom-restaurant-marker',
        html: `<div class="marker-pin"><div class="marker-inner"></div></div>`,
        iconSize: [36, 46],
        iconAnchor: [18, 42]
      });

      // Traducciones para el Popup
      const noDesc = this.translate.instant('MAP.NO_DESC');
      const nombre = r.name ?? r.nombre ?? 'Restaurante';
      const descripcion = r.description ?? r.descripcion ?? noDesc;
      const categoria = r.category ?? r.categoria ?? '';
      const imagen = r.imagenUrl ?? r.image_url ?? r.imageUrl ?? r.imagen_url ?? '';
      const uuid = r.uuid ?? r.id ?? '';
      const popupHtml = this.buildPopupHtml(nombre, descripcion, categoria, imagen, uuid);

      const marker = L.marker([lat, lng], { icon: icono })
        .bindPopup(popupHtml, { maxWidth: 290, className: 'custom-popup' });

      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.querySelector<HTMLButtonElement>(
            `.restaurant-popup-btn[data-uuid="${r.uuid ?? r.id ?? ''}"]`
          );
          if (btn) {
            btn.addEventListener('click', () => {
              this.router.navigate(['/restaurant-view', btn.dataset['uuid']]);
            });
          }
        }, 50);
      });

      this.markersLayer.addLayer(marker);
    });
  }

  private buildPopupHtml(
    nombre: string,
    descripcion: string,
    categoria: string,
    imagen: string,
    uuid: string
  ): string {
    const safeNombre     = this.escapeHtml(nombre      || 'Restaurante');
    const safeDescripcion = this.escapeHtml(descripcion || this.translate.instant('MAP.NO_DESC'));
    const safeCategoria  = this.escapeHtml(categoria   || 'Sin categoría');
    const safeImagen     = this.escapeHtml(imagen      || '');
    const btnLabel       = 'Ver restaurante';

    const mediaHtml = safeImagen
      ? `<div class="restaurant-popup-media">
           <img
             class="restaurant-popup-image"
             src="${safeImagen}"
             alt="Foto de ${safeNombre}"
             loading="lazy"
             onerror="this.parentElement.classList.add('no-image'); this.remove();">
           <div class="restaurant-popup-fallback" aria-hidden="true">🍽️</div>
         </div>`
      : `<div class="restaurant-popup-media no-image">
           <div class="restaurant-popup-fallback only" aria-hidden="true">🍽️</div>
         </div>`;

    return `
      <article class="restaurant-popup-card">
        ${mediaHtml}
        <div class="restaurant-popup-body">
          <span class="restaurant-popup-category">${safeCategoria}</span>
          <h3 class="restaurant-popup-title">${safeNombre}</h3>
          <p class="restaurant-popup-desc">${safeDescripcion}</p>
          <button
            class="restaurant-popup-btn"
            data-uuid="${uuid}"
            type="button">
            ${btnLabel}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </article>
    `;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  buscarRestaurante(texto: string): void {
    this.textoBusqueda = texto;
    this.filtrarRestaurantes();
  }

  seleccionarCategoria(slug: string): void {
    this.categoriaSeleccionada = slug;
    this.router.navigate([], { queryParams: { categoria: slug || null }, queryParamsHandling: 'merge' });
    this.filtrarRestaurantes();
  }

  verTodasLasCategorias(): void { this.seleccionarCategoria(''); }
  volverAlInicio(): void { this.router.navigate(['/inicio']); }
  centrarEnMiUbicacion(): void { this.obtenerUbicacion(); }
}