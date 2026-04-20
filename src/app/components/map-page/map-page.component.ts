import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ChangeDetectorRef, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RestauranteService } from '../../core/services/restaurante.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, finalize, takeUntil, timeout } from 'rxjs';
import * as L from 'leaflet';

/* ────────────────────────────────────────────────────────────────
   INTERFACES — listas para conectar con el chatbot real
   ──────────────────────────────────────────────────────────────── */

export interface ChatMensaje {
  id: string;
  rol: 'bot' | 'user';
  texto: string;
  hora: string;
}

/**
 * Interfaz esperada del ChatbotService real.
 * Tus compañeros deben crear un servicio Angular con esta firma:
 *
 *   chatbotService.enviarMensaje(texto: string): Promise<string>
 *
 * Luego inyectarlo en el constructor y reemplazar mockResponder().
 */
export interface IChatbotService {
  enviarMensaje(texto: string): Promise<string>;
}

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './map-page.html',
  styleUrls: ['./map-page.css']
})
export class MapPage implements OnInit, AfterViewInit, OnDestroy {

  /* ── Mapa ──────────────────────────────────────────────────── */
  private map!: L.Map;
  private markersLayer = L.layerGroup();
  private locationMarker?: L.Marker;

  categorias = [
    { label: 'CATEGORIES.ALL',        slug: '' },
    { label: 'CATEGORIES.SALTEÑAS',   slug: 'Salteñas' },
    { label: 'CATEGORIES.CHICHARRON', slug: 'Chicharron' },
    { label: 'CATEGORIES.SUSHI',      slug: 'Sushi' },
    { label: 'CATEGORIES.TYPICAL',    slug: 'Comida Tipica' },
    { label: 'CATEGORIES.PIZZA',      slug: 'Pizzeria' },
    { label: 'CATEGORIES.BURGERS',    slug: 'Hamburguesas' },
    { label: 'CATEGORIES.TACOS',      slug: 'Tacos' },
    { label: 'CATEGORIES.GRILL',      slug: 'Parrilla' },
  ];

  categoriaSeleccionada: string = '';
  textoBusqueda: string = '';
  mostrarBienvenida: boolean = true;
  sinResultados: boolean = false;
  categoriaSinResultados: string = '';
  cargando: boolean = true;
  errorApi: boolean = false;
  private restaurantes: any[] = [];

  /* ── Chatbot ───────────────────────────────────────────────── */

  @ViewChild('chatMessages') private chatMessagesRef!: ElementRef<HTMLDivElement>;

  chatbotAbierto: boolean = false;
  chatbotEscribiendo: boolean = false;
  mensajeActual: string = '';
  mensajesNoLeidos: number = 0;
  mostrarSugerencias: boolean = true;

  chatMensajes: ChatMensaje[] = [
    {
      id: '1',
      rol: 'bot',
      texto: '¡Hola! 👋 Soy tu asistente de Antojitos. Cuéntame qué tipo de comida te apetece hoy y te recomiendo los mejores restaurantes del mapa.',
      hora: this.horaActual()
    }
  ];

  sugerenciasRapidas: string[] = [
    '🌮 Quiero tacos',
    '🍕 Algo italiano',
    '🥩 Comida típica boliviana',
    '🍣 Me apetece sushi',
    '🍔 Una buena hamburguesa',
  ];

  /* ── Respuestas mock ────────────────────────────────────────
     TODO: eliminar cuando el ChatbotService real esté listo.
     ─────────────────────────────────────────────────────────── */
  private mockRespuestas: Record<string, string> = {
    taco:     '¡Buena elección! 🌮 En el mapa encontrarás varias taquerías con excelente sazón. Te recomiendo filtrar por la categoría "Tacos" para verlos todos.',
    pizza:    '🍕 ¡Perfecto! Hay un par de pizzerías muy bien valoradas cerca. Activa el filtro "Pizzería" y los verás destacados en el mapa.',
    sushi:    '🍣 ¡Amo el sushi! Hay opciones frescas disponibles. Filtra por "Sushi" para ubicarlas en el mapa.',
    burger:   '🍔 ¡Hamburguesas! Selecciona "Hamburguesas" en las categorías y encuentra las mejores del área.',
    tipic:    '🇧🇴 ¡Comida boliviana! Nada como un buen plato típico. Activa "Comida Típica" en los filtros.',
    salteña:  '☀️ ¡Las salteñas son perfectas a esta hora! Filtra por "Salteñas" y encuentra las más cercanas.',
    chicharr: '🥩 ¡Chicharrón, qué buena idea! Selecciona "Chicharrón" en el menú de categorías.',
    default:  'Entendido 🤔 Puedo ayudarte a encontrar restaurantes según tu antojo. Cuéntame más o usa los filtros del mapa para explorar.'
  };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private restauranteService: RestauranteService,
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {}

  /* ══════════════════════════════════════════════════════════════
     CICLO DE VIDA
     ══════════════════════════════════════════════════════════════ */

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.categoriaSeleccionada = params['categoria'] || '';
        this.filtrarRestaurantes();
        this.refreshView();
      });
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

  /* ══════════════════════════════════════════════════════════════
     MAPA
     ══════════════════════════════════════════════════════════════ */

  private initMap(): void {
    if (this.map) this.map.remove();
    const mapContainer = L.DomUtil.get('map') as (HTMLElement & { _leaflet_id?: number }) | null;
    if (mapContainer?._leaflet_id) mapContainer._leaflet_id = undefined;

    this.map = L.map('map', { center: [-17.3935, -66.1568], zoom: 15, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    this.markersLayer.addTo(this.map);
  }

  private obtenerUbicacion(): void {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const iconoUbicacion = L.divIcon({
          className: 'user-location-marker',
          html: `<div class="user-pulse-ring"></div><div class="user-dot"></div>`,
          iconSize: [20, 20], iconAnchor: [10, 10]
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
        finalize(() => { this.cargando = false; this.refreshView(); })
      )
      .subscribe({
        next: (data: any) => {
          if (Array.isArray(data))   this.restaurantes = data;
          else if (data?.data)       this.restaurantes = data.data;
          else                       this.restaurantes = [];
          this.filtrarRestaurantes();
        },
        error: (err) => {
          console.error('Error:', err);
          this.errorApi = true;
          this.refreshView();
        }
      });
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

    const currentCat = this.categorias.find(c => c.slug.toLowerCase() === this.categoriaSeleccionada.toLowerCase());
    this.categoriaSinResultados = currentCat ? currentCat.label : this.categoriaSeleccionada;
    this.sinResultados     = filtrados.length === 0 && !!this.categoriaSeleccionada;
    this.mostrarBienvenida = filtrados.length === 0 && !this.categoriaSeleccionada;

    filtrados.forEach(r => {
      const lat = r.latitude ?? r.lat ?? r.latitud;
      const lng = r.longitude ?? r.lng ?? r.longitud;
      if (lat == null || lng == null) return;

      const icono = L.divIcon({
        className: 'custom-restaurant-marker',
        html: `<div class="marker-pin"><div class="marker-inner"></div></div>`,
        iconSize: [36, 46], iconAnchor: [18, 42]
      });

      const noDesc      = this.translate.instant('MAP.NO_DESC');
      const nombre      = r.name ?? r.nombre ?? 'Restaurante';
      const descripcion = r.description ?? r.descripcion ?? noDesc;
      const categoria   = r.category ?? r.categoria ?? '';
      const imagen      = r.imagenUrl ?? r.image_url ?? r.imageUrl ?? r.imagen_url ?? '';
      const uuid        = r.uuid ?? r.id ?? '';

      const marker = L.marker([lat, lng], { icon: icono })
        .bindPopup(this.buildPopupHtml(nombre, descripcion, categoria, imagen, uuid), {
          maxWidth: 290, className: 'custom-popup'
        });

      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.querySelector<HTMLButtonElement>(
            `.restaurant-popup-btn[data-uuid="${uuid}"]`
          );
          btn?.addEventListener('click', () => {
            this.router.navigate(['/restaurant-view', btn.dataset['uuid']]);
          });
        }, 50);
      });

      this.markersLayer.addLayer(marker);
    });
  }

  private buildPopupHtml(
    nombre: string, descripcion: string,
    categoria: string, imagen: string, uuid: string
  ): string {
    const sN = this.escapeHtml(nombre      || 'Restaurante');
    const sD = this.escapeHtml(descripcion || this.translate.instant('MAP.NO_DESC'));
    const sC = this.escapeHtml(categoria   || 'Sin categoría');
    const sI = this.escapeHtml(imagen      || '');

    const mediaHtml = sI
      ? `<div class="restaurant-popup-media">
           <img class="restaurant-popup-image" src="${sI}" alt="Foto de ${sN}" loading="lazy"
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
          <span class="restaurant-popup-category">${sC}</span>
          <h3 class="restaurant-popup-title">${sN}</h3>
          <p class="restaurant-popup-desc">${sD}</p>
          <button class="restaurant-popup-btn" data-uuid="${uuid}" type="button">
            Ver restaurante
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </article>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g,  '&#39;');
  }

  /* ══════════════════════════════════════════════════════════════
     CHATBOT
     ══════════════════════════════════════════════════════════════ */

  toggleChatbot(): void {
    this.chatbotAbierto = !this.chatbotAbierto;
    if (this.chatbotAbierto) {
      this.mensajesNoLeidos = 0;
      setTimeout(() => this.scrollAlFinal(), 100);
    }
    this.refreshView();
  }

  async enviarMensaje(texto: string): Promise<void> {
    const trimmed = texto.trim();
    if (!trimmed || this.chatbotEscribiendo) return;

    this.agregarMensaje('user', trimmed);
    this.mostrarSugerencias = false;
    this.chatbotEscribiendo = true;
    this.refreshView();

    // ══════════════════════════════════════════════════════════
    // PUNTO DE CONEXIÓN — reemplazar cuando el servicio esté listo
    //
    //   Cambiar esta línea:
    //     const respuesta = await this.mockResponder(trimmed);
    //   Por:
    //     const respuesta = await this.chatbotService.enviarMensaje(trimmed);
    //
    //   El servicio debe devolver Promise<string> u Observable<string>.
    //   Recuerda inyectarlo en el constructor y eliminar mockResponder().
    // ══════════════════════════════════════════════════════════
    const respuesta = await this.mockResponder(trimmed);

    this.chatbotEscribiendo = false;
    this.agregarMensaje('bot', respuesta);

    if (!this.chatbotAbierto) this.mensajesNoLeidos++;
    this.refreshView();
    setTimeout(() => this.scrollAlFinal(), 50);
  }

  enviarSugerencia(texto: string): void {
    this.enviarMensaje(texto);
  }

  private agregarMensaje(rol: 'bot' | 'user', texto: string): void {
    this.chatMensajes.push({
      id: Date.now().toString(),
      rol,
      texto,
      hora: this.horaActual()
    });
  }

  private scrollAlFinal(): void {
    if (this.chatMessagesRef?.nativeElement) {
      const el = this.chatMessagesRef.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  private horaActual(): string {
    return new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  }

  /* ── Mock — ELIMINAR cuando el chatbot real esté listo ──────── */
  private mockResponder(texto: string): Promise<string> {
    const lower = texto.toLowerCase();
    const respuesta =
      lower.includes('taco')                           ? this.mockRespuestas['taco']     :
      lower.includes('pizza')                          ? this.mockRespuestas['pizza']    :
      lower.includes('sushi')                          ? this.mockRespuestas['sushi']    :
      lower.includes('burger') || lower.includes('hambur') ? this.mockRespuestas['burger'] :
      lower.includes('típic')  || lower.includes('tipic')  ? this.mockRespuestas['tipic']  :
      lower.includes('salteña')                        ? this.mockRespuestas['salteña']  :
      lower.includes('chichar')                        ? this.mockRespuestas['chicharr'] :
      this.mockRespuestas['default'];

    const delay = 800 + Math.random() * 700;
    return new Promise(resolve => setTimeout(() => resolve(respuesta), delay));
  }
  /* ─────────────────────────────────────────────────────────── */

  /* ══════════════════════════════════════════════════════════════
     HELPERS
     ══════════════════════════════════════════════════════════════ */

  private refreshView(): void {
    try { this.cd.detectChanges(); } catch { /* vista destruida */ }
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
  volverAlInicio(): void        { this.router.navigate(['/inicio']); }
  centrarEnMiUbicacion(): void  { this.obtenerUbicacion(); }
}