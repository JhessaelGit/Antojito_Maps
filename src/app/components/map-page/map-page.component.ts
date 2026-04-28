import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ChangeDetectorRef, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RestauranteService } from '../../core/services/restaurante.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, finalize, takeUntil, timeout } from 'rxjs';
import * as L from 'leaflet';
import { ChatService } from '../../core/services/chat.service';


export interface ChatMensaje {
  id: string;
  rol: 'bot' | 'user';
  texto: string;
  hora: string;
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
  private chatbotMarkersLayer = L.layerGroup(); // Capa para recomendaciones del bot
  private locationMarker?: L.Marker;

  categorias = [
    { label: 'CATEGORIES.ALL', slug: '' },
    { label: 'CATEGORIES.SALTEÑAS', slug: 'Salteñas' },
    { label: 'CATEGORIES.CHICHARRON', slug: 'Chicharron' },
    { label: 'CATEGORIES.SUSHI', slug: 'Sushi' },
    { label: 'CATEGORIES.TYPICAL', slug: 'Comida Tipica' },
    { label: 'CATEGORIES.PIZZA', slug: 'Pizzeria' },
    { label: 'CATEGORIES.BURGERS', slug: 'Hamburguesas' },
    { label: 'CATEGORIES.TACOS', slug: 'Tacos' },
    { label: 'CATEGORIES.GRILL', slug: 'Parrilla' },
  ];

  categoriaSeleccionada: string = '';
  textoBusqueda: string = '';
  mostrarBienvenida: boolean = true;
  sinResultados: boolean = false;
  categoriaSinResultados: string = '';
  cargando: boolean = true;
  errorApi: boolean = false;
  private restaurantes: any[] = [];
  private conversationId: string | null = null;
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

  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private restauranteService: RestauranteService,
    private chatService: ChatService, // 🔥 AGREGAR
    private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.categoriaSeleccionada = params['categoria'] || '';
        this.filtrarRestaurantes();
        this.refreshView();
      });
    this.cargarRestaurantes();
    this.restaurarConversacion();
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
    if (mapContainer?._leaflet_id) mapContainer._leaflet_id = undefined;

    this.map = L.map('map', { center: [-17.3935, -66.1568], zoom: 15, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
    this.chatbotMarkersLayer.addTo(this.map);
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
    this.restauranteService.getRestaurantes()
      .pipe(
        timeout(15000),
        takeUntil(this.destroy$),
        finalize(() => { this.cargando = false; this.refreshView(); })
      )
      .subscribe({
        next: (data: any) => {
          this.restaurantes = Array.isArray(data) ? data : (data?.data || []);
          this.filtrarRestaurantes();
        },
        error: (err) => {
          console.error('Error:', err);
          this.errorApi = true;
          this.refreshView();
        }
      });
  }

  private mostrarRecomendacionesEnMapa(slug: string): void {
    if (!slug) return;
    this.chatbotMarkersLayer.clearLayers();

    const recomendados = this.restaurantes.filter(r =>
      (r.category ?? r.categoria ?? '').toLowerCase() === slug.toLowerCase()
    );

    recomendados.forEach(r => {
      const lat = r.latitude ?? r.lat ?? r.latitud;
      const lng = r.longitude ?? r.lng ?? r.longitud;
      if (lat == null || lng == null) return;

      const iconoChatbot = L.divIcon({
        className: 'chatbot-recommendation-marker',
        html: `<div class="marker-pin-bot"><div class="marker-inner-bot"></div></div>`,
        iconSize: [38, 48], iconAnchor: [19, 44]
      });

      const uuid = r.uuid ?? r.id ?? '';
      const marker = L.marker([lat, lng], { icon: iconoChatbot })
        .bindPopup(this.buildPopupHtml(
          r.name ?? 'Recomendado',
          r.description ?? '',
          r.category ?? '',
          r.imagenUrl ?? '',
          uuid
        ), { maxWidth: 290, className: 'custom-popup' });

      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.querySelector<HTMLButtonElement>(`.restaurant-popup-btn[data-uuid="${uuid}"]`);
          btn?.addEventListener('click', () => this.router.navigate(['/restaurant-view', uuid]));
        }, 50);
      });

      this.chatbotMarkersLayer.addLayer(marker);
    });

    if (recomendados.length > 0) {
      const group = L.featureGroup(this.chatbotMarkersLayer.getLayers() as L.Marker[]);
      this.map.fitBounds(group.getBounds().pad(0.3));
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

    const currentCat = this.categorias.find(c => c.slug.toLowerCase() === this.categoriaSeleccionada.toLowerCase());
    this.categoriaSinResultados = currentCat ? currentCat.label : this.categoriaSeleccionada;
    this.sinResultados = filtrados.length === 0 && !!this.categoriaSeleccionada;
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

      const uuid = r.uuid ?? r.id ?? '';
      const marker = L.marker([lat, lng], { icon: icono })
        .bindPopup(this.buildPopupHtml(
          r.name ?? r.nombre ?? 'Restaurante',
          r.description ?? r.descripcion ?? '',
          r.category ?? r.categoria ?? '',
          r.imagenUrl ?? r.image_url ?? '',
          uuid
        ), { maxWidth: 290, className: 'custom-popup' });

      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.querySelector<HTMLButtonElement>(`.restaurant-popup-btn[data-uuid="${uuid}"]`);
          btn?.addEventListener('click', () => this.router.navigate(['/restaurant-view', uuid]));
        }, 50);
      });

      this.markersLayer.addLayer(marker);
    });
  }

  private buildPopupHtml(n: string, d: string, c: string, i: string, u: string): string {
    const sN = this.escapeHtml(n);
    const sD = this.escapeHtml(d || this.translate.instant('MAP.NO_DESC'));
    const sC = this.escapeHtml(c || 'General');
    const mediaHtml = i ? `<div class="restaurant-popup-media"><img src="${this.escapeHtml(i)}" class="restaurant-popup-image" onerror="this.parentElement.classList.add('no-image'); this.remove();"><div class="restaurant-popup-fallback">🍽️</div></div>` : `<div class="restaurant-popup-media no-image"><div class="restaurant-popup-fallback only">🍽️</div></div>`;

    return `<article class="restaurant-popup-card">${mediaHtml}<div class="restaurant-popup-body"><span class="restaurant-popup-category">${sC}</span><h3 class="restaurant-popup-title">${sN}</h3><p class="restaurant-popup-desc">${sD}</p><button class="restaurant-popup-btn" data-uuid="${u}" type="button">Ver restaurante</button></div></article>`;
  }

  private escapeHtml(v: string): string {
    return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

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

    // Obtener ubicacion del usuario si esta disponible
    const userLocation = this.locationMarker?.getLatLng();

    this.chatService.enviarMensaje({
      conversationId: this.conversationId ?? undefined,
      message: trimmed,
      latitude: userLocation?.lat,
      longitude: userLocation?.lng
    }).subscribe({
      next: (res) => {
        this.conversationId = res.conversationId;
        localStorage.setItem('antojitos_conversationId', res.conversationId);

        this.chatbotEscribiendo = false;
        this.agregarMensaje('bot', res.reply);

        this.procesarBusquedaIA(trimmed);

        if (!this.chatbotAbierto) this.mensajesNoLeidos++;
        this.refreshView();
        setTimeout(() => this.scrollAlFinal(), 50);
      },
      error: () => {
        this.chatbotEscribiendo = false;
        this.agregarMensaje('bot', 'Error al obtener respuesta del servidor.');
        this.refreshView();
      }
    });
  }

  enviarSugerencia(texto: string): void { this.enviarMensaje(texto); }

  private agregarMensaje(rol: 'bot' | 'user', texto: string): void {
    this.chatMensajes.push({ id: Date.now().toString(), rol, texto, hora: this.horaActual() });
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

  /**
   * Restaura la conversacion desde localStorage al recargar la pagina.
   * Carga el historial de mensajes desde el backend.
   */
  private restaurarConversacion(): void {
    const savedId = localStorage.getItem('antojitos_conversationId');
    if (!savedId) return;

    this.conversationId = savedId;
    this.chatService.obtenerHistorial(savedId).subscribe({
      next: (historial) => {
        if (historial.messages && historial.messages.length > 0) {
          // Reemplazar el mensaje de bienvenida con el historial real
          this.chatMensajes = historial.messages.map((m: any, i: number) => ({
            id: (i + 1).toString(),
            rol: m.role === 'assistant' ? 'bot' as const : 'user' as const,
            texto: m.content,
            hora: m.timestamp
              ? new Date(m.timestamp).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
              : ''
          }));
          this.mostrarSugerencias = false;
          this.refreshView();
          setTimeout(() => this.scrollAlFinal(), 100);
        }
      },
      error: () => {
        // Conversacion no encontrada, limpiar localStorage
        localStorage.removeItem('antojitos_conversationId');
        this.conversationId = null;
      }
    });
  }

  private procesarBusquedaIA(texto: string): void {
    if (!this.locationMarker) return;

    const userLatLng = this.locationMarker.getLatLng();
    const categoria = this.parsearCategoria(texto);

    let resultados = this.buscarRestaurantesCercanos(
      userLatLng.lat,
      userLatLng.lng,
      0.1,
      categoria
    );

    // Si no hay categoría detectada pero el usuario escribió algo, intentar buscar por texto
    if (!categoria && texto) {
      const terminos = texto.toLowerCase().split(' ').filter(t => t.length > 3);
      if (terminos.length > 0) {
        resultados = this.restaurantes.filter(r => {
          const lat = r.latitude ?? r.lat ?? r.latitud;
          const lng = r.longitude ?? r.lng ?? r.longitud;
          if (lat == null || lng == null) return false;

          const distancia = this.calcularDistanciaKm(userLatLng.lat, userLatLng.lng, lat, lng);
          if (distancia > 10) return false;

          const nombre = (r.name ?? r.nombre ?? '').toLowerCase();
          const desc = (r.description ?? r.descripcion ?? '').toLowerCase();
          return terminos.some(t => nombre.includes(t) || desc.includes(t));
        });
      }
    }

    if (resultados.length > 0) {
      this.mostrarResultadosEnMapa(resultados);
    } else {
      const fallback = this.obtenerRecomendacionFallback(userLatLng.lat, userLatLng.lng, categoria);

      if (fallback) {
        const nombreRes = fallback.r.name ?? fallback.r.nombre ?? 'un restaurante';
        const distFormateada = fallback.distancia.toFixed(1);

        let mensajeFallback = '';
        if (fallback.tipo === 'categoria_lejos') {
          mensajeFallback = `No encontré opciones de esa categoría dentro de 10 km. Sin embargo, te recomiendo "${nombreRes}", que está a ${distFormateada} km de distancia.`;
        } else {
          mensajeFallback = `No encontré lo que buscabas cerca. Como alternativa, te sugiero "${nombreRes}", nuestro local más cercano a ${distFormateada} km.`;
        }

        this.agregarMensaje('bot', mensajeFallback);
        this.mostrarResultadosEnMapa([fallback.r]);
      } else {
        this.agregarMensaje('bot', 'Lo siento, no hay restaurantes disponibles en este momento.');
      }
    }
  }

  private parsearCategoria(texto: string): string | null {
    const lower = texto.toLowerCase();
    if (lower.includes('taco')) return 'Tacos';
    if (lower.includes('pizza') || lower.includes('italia')) return 'Pizzeria';
    if (lower.includes('sushi')) return 'Sushi';
    if (lower.includes('burger') || lower.includes('hamburguesa')) return 'Hamburguesas';
    if (lower.includes('típic') || lower.includes('tipic')) return 'Comida Tipica';
    if (lower.includes('salteña')) return 'Salteñas';
    if (lower.includes('chichar')) return 'Chicharron';
    if (lower.includes('parrilla') || lower.includes('carne')) return 'Parrilla';
    return null;
  }

  private buscarRestaurantesCercanos(userLat: number, userLng: number, radioKm: number, categoria: string | null): any[] {
    return this.restaurantes.filter(r => {
      const lat = r.latitude ?? r.lat ?? r.latitud;
      const lng = r.longitude ?? r.lng ?? r.longitud;
      if (lat == null || lng == null) return false;

      const rCat = (r.category ?? r.categoria ?? '').toLowerCase();
      if (categoria && rCat !== categoria.toLowerCase()) return false;

      const distancia = this.calcularDistanciaKm(userLat, userLng, lat, lng);
      return distancia <= radioKm;
    });
  }

  private obtenerRecomendacionFallback(userLat: number, userLng: number, categoriaDeseada: string | null): { r: any, distancia: number, tipo: string } | null {
    if (this.restaurantes.length === 0) return null;

    let mejorOpcionCat = null;
    let menorDistanciaCat = Infinity;

    let mejorOpcionCualquiera = null;
    let menorDistanciaCualquiera = Infinity;

    for (const r of this.restaurantes) {
      const lat = r.latitude ?? r.lat ?? r.latitud;
      const lng = r.longitude ?? r.lng ?? r.longitud;
      if (lat == null || lng == null) continue;

      const rCat = (r.category ?? r.categoria ?? '').toLowerCase();
      const distancia = this.calcularDistanciaKm(userLat, userLng, lat, lng);

      if (categoriaDeseada && rCat === categoriaDeseada.toLowerCase()) {
        if (distancia < menorDistanciaCat) {
          menorDistanciaCat = distancia;
          mejorOpcionCat = r;
        }
      }

      if (distancia < menorDistanciaCualquiera) {
        menorDistanciaCualquiera = distancia;
        mejorOpcionCualquiera = r;
      }
    }

    if (mejorOpcionCat && categoriaDeseada) {
      return { r: mejorOpcionCat, distancia: menorDistanciaCat, tipo: 'categoria_lejos' };
    }

    if (mejorOpcionCualquiera) {
      return { r: mejorOpcionCualquiera, distancia: menorDistanciaCualquiera, tipo: 'cercano_general' };
    }

    return null;
  }

  private calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(valor: number): number {
    return valor * Math.PI / 180;
  }

  private mostrarResultadosEnMapa(restaurantes: any[]): void {
    this.chatbotMarkersLayer.clearLayers();

    restaurantes.forEach(r => {
      const lat = r.latitude ?? r.lat ?? r.latitud;
      const lng = r.longitude ?? r.lng ?? r.longitud;
      if (lat == null || lng == null) return;

      const iconoChatbot = L.divIcon({
        className: 'chatbot-recommendation-marker',
        html: `<div class="marker-pin-bot"><div class="marker-inner-bot"></div></div>`,
        iconSize: [38, 48], iconAnchor: [19, 44]
      });

      const uuid = r.uuid ?? r.id ?? '';
      const marker = L.marker([lat, lng], { icon: iconoChatbot })
        .bindPopup(this.buildPopupHtml(
          r.name ?? r.nombre ?? 'Recomendado',
          r.description ?? r.descripcion ?? '',
          r.category ?? r.categoria ?? '',
          r.imagenUrl ?? r.image_url ?? '',
          uuid
        ), { maxWidth: 290, className: 'custom-popup' });

      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.querySelector<HTMLButtonElement>(`.restaurant-popup-btn[data-uuid="${uuid}"]`);
          btn?.addEventListener('click', () => this.router.navigate(['/restaurant-view', uuid]));
        }, 50);
      });

      this.chatbotMarkersLayer.addLayer(marker);
    });

    if (restaurantes.length > 0) {
      const group = L.featureGroup(this.chatbotMarkersLayer.getLayers() as L.Marker[]);
      this.map.fitBounds(group.getBounds().pad(0.3));
    }
  }
  private refreshView(): void { try { this.cd.detectChanges(); } catch { } }
  buscarRestaurante(texto: string): void { this.textoBusqueda = texto; this.filtrarRestaurantes(); }
  seleccionarCategoria(slug: string): void { this.categoriaSeleccionada = slug; this.router.navigate([], { queryParams: { categoria: slug || null }, queryParamsHandling: 'merge' }); this.filtrarRestaurantes(); }
  verTodasLasCategorias(): void { this.seleccionarCategoria(''); }
  volverAlInicio(): void { this.location.back(); }
  centrarEnMiUbicacion(): void { this.obtenerUbicacion(); }
}