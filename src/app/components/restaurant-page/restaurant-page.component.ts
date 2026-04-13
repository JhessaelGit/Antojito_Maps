import { Component, OnInit, OnDestroy, AfterViewInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RestauranteService } from '../../core/services/restaurante.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-restaurant-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './restaurant-page.html',
  styleUrl: './restaurant-page.css',
})
export class RestaurantPage implements OnInit, OnDestroy, AfterViewInit {

  restaurantImage:    string | null = null;
  restaurantName:     string = 'Mi Restaurante';
  restaurantCategory: string = '';
  restaurantLat:      number | null = null;
  restaurantLng:      number | null = null;

  get selectedPlan(): string {
    return localStorage.getItem('selected_plan') || 'BASIC';
  }

  vistaActiva: 'promos' | 'menu' | 'perfil' = 'promos';

  promociones: any[] = [
    {
      id: 1,
      nombre: '10% de descuento en Combo 1',
      descripcion: 'Papas + Arroz + 2 Presas + Refresco',
      precio: 21.6,
      fechaExpiracion: new Date(Date.now() + 86400000)
    }
  ];

  menu: any[] = [
    { id: 101, nombre: '2 Presas',  descripcion: 'Papas + arroz + 2 presas de pollo', precio: 45 },
    { id: 102, nombre: 'Combo 1',   descripcion: 'Papas + Arroz + 2 Presas + Refresco', precio: 35 }
  ];

  editandoItem        = false;
  esPromo             = false;
  itemTemporal: any   = {};
  mostrandoUndo       = false;
  ultimoItemEliminado: any = null;
  tipoItemEliminado: 'promo' | 'menu' | null = null;

  // Perfil editable
  perfilNombre:      string = '';
  perfilCategoria:   string = '';
  perfilDescripcion: string = '';
  perfilImagePreview: string | null = null;
  perfilImageFile:   File | null = null;
  guardandoPerfil    = false;

  // Mapa de ubicación
  private mapaUbicacion?: L.Map;
  private mapaMarker?:   L.Marker;
  mapaListo            = false;

  private timerUndo:            any;
  private timerCheckExpiracion: any;

  constructor(
    public  router:             Router,
    private restauranteService: RestauranteService,
    private ngZone:             NgZone,
    private cd:                 ChangeDetectorRef
  ) {}

  ngOnInit() {
    const uuid = localStorage.getItem('restaurant_uuid');
    if (uuid) {
      this.restauranteService.getRestauranteById(uuid).subscribe({
        next: (data: any) => {
          this.restaurantName      = data.name      ?? localStorage.getItem('restaurant_name')     ?? 'Mi Restaurante';
          this.restaurantCategory  = data.category  ?? localStorage.getItem('restaurant_category') ?? '';
          this.restaurantImage     = data.imagenUrl ?? data.image_url ?? localStorage.getItem('restaurant_image');
          this.restaurantLat       = data.latitude  ?? null;
          this.restaurantLng       = data.longitude ?? null;
          this.sincronizarPerfil();
        },
        error: () => this.cargarDesdeLocalStorage()
      });
    } else {
      this.cargarDesdeLocalStorage();
    }

    this.timerCheckExpiracion = setInterval(() => this.verificarExpiracion(), 10000);
  }

  ngAfterViewInit() {}

  private cargarDesdeLocalStorage() {
    this.restaurantImage    = localStorage.getItem('restaurant_image');
    this.restaurantName     = localStorage.getItem('restaurant_name')     ?? 'Mi Restaurante';
    this.restaurantCategory = localStorage.getItem('restaurant_category') ?? '';
    this.sincronizarPerfil();
  }

  private sincronizarPerfil() {
    this.perfilNombre     = this.restaurantName;
    this.perfilCategoria  = this.restaurantCategory;
    this.perfilImagePreview = this.restaurantImage;
  }

  cambiarVista(vista: 'promos' | 'menu' | 'perfil') {
    this.vistaActiva = vista;
    if (vista === 'perfil') {
      setTimeout(() => this.initMapaPerfil(), 200);
    }
  }

  private initMapaPerfil() {
    if (this.mapaListo) {
      this.mapaUbicacion?.invalidateSize();
      return;
    }

    const container = document.getElementById('perfil-map') as any;
    if (!container) return;
    if (container._leaflet_id) container._leaflet_id = undefined;

    const lat = this.restaurantLat ?? -17.3935;
    const lng = this.restaurantLng ?? -66.1568;

    this.mapaUbicacion = L.map('perfil-map', { center: [lat, lng], zoom: 15 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.mapaUbicacion);

    const icono = L.divIcon({
      html: `<div style="width:24px;height:24px;background:#7F1100;border:3px solid #BF9861;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(127,17,0,0.5);"></div>`,
      iconSize: [24, 24], iconAnchor: [12, 24], className: ''
    });

    if (this.restaurantLat && this.restaurantLng) {
      this.mapaMarker = L.marker([lat, lng], { icon: icono, draggable: true }).addTo(this.mapaUbicacion);
      this.mapaMarker.on('dragend', (e: any) => {
        this.ngZone.run(() => {
          const pos = e.target.getLatLng();
          this.restaurantLat = pos.lat;
          this.restaurantLng = pos.lng;
          this.cd.detectChanges();
        });
      });
    }

    this.mapaUbicacion.on('click', (e: L.LeafletMouseEvent) => {
      this.ngZone.run(() => {
        this.restaurantLat = e.latlng.lat;
        this.restaurantLng = e.latlng.lng;
        if (this.mapaMarker) {
          this.mapaMarker.setLatLng(e.latlng);
        } else {
          this.mapaMarker = L.marker(e.latlng, { icon: icono, draggable: true }).addTo(this.mapaUbicacion!);
        }
        this.cd.detectChanges();
      });
    });

    this.mapaListo = true;
  }

  onPerfilFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.procesarImagenPerfil(input.files[0]);
  }

  onPerfilDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.procesarImagenPerfil(file);
  }

  private procesarImagenPerfil(file: File) {
    if (file.size > 5 * 1024 * 1024) return;
    this.perfilImageFile = file;
    const reader = new FileReader();
    reader.onload = e => {
      this.perfilImagePreview = e.target?.result as string;
      this.cd.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  quitarImagenPerfil(event: Event) {
    event.stopPropagation();
    this.perfilImageFile    = null;
    this.perfilImagePreview = null;
  }

  guardarPerfil() {
    this.guardandoPerfil = true;
    this.restaurantName     = this.perfilNombre;
    this.restaurantCategory = this.perfilCategoria;
    if (this.perfilImagePreview) {
      this.restaurantImage = this.perfilImagePreview;
      localStorage.setItem('restaurant_image', this.perfilImagePreview);
    }
    localStorage.setItem('restaurant_name',     this.perfilNombre);
    localStorage.setItem('restaurant_category', this.perfilCategoria);
    setTimeout(() => {
      this.guardandoPerfil = false;
      this.cd.detectChanges();
    }, 800);
  }

  ngOnDestroy() {
    if (this.timerCheckExpiracion) clearInterval(this.timerCheckExpiracion);
    if (this.timerUndo)            clearTimeout(this.timerUndo);
    if (this.mapaUbicacion)        this.mapaUbicacion.remove();
  }

  verificarExpiracion() {
    const ahora = new Date();
    this.promociones = this.promociones.filter(p => new Date(p.fechaExpiracion) > ahora);
  }

  crearPromo() {
    this.esPromo = true;
    const ahora   = new Date();
    const offSet  = ahora.getTimezoneOffset() * 60000;
    const localISO = new Date(ahora.getTime() - offSet).toISOString().slice(0, 16);
    this.itemTemporal = { id: Date.now(), nombre: '', descripcion: '', precio: 0, fechaExpiracionFormateada: localISO };
    this.editandoItem = true;
  }

  crearMenu() {
    this.esPromo = false;
    this.itemTemporal = { id: Date.now(), nombre: '', descripcion: '', precio: 0 };
    this.editandoItem = true;
  }

  editarPromo(promo: any) {
    this.esPromo = true;
    const date   = new Date(promo.fechaExpiracion);
    const offSet = date.getTimezoneOffset() * 60000;
    const localISO = new Date(date.getTime() - offSet).toISOString().slice(0, 16);
    this.itemTemporal = { ...promo, fechaExpiracionFormateada: localISO };
    this.editandoItem = true;
  }

  editarMenu(item: any) {
    this.esPromo      = false;
    this.itemTemporal = { ...item };
    this.editandoItem = true;
  }

  guardarCambios() {
    if (this.esPromo) {
      this.itemTemporal.fechaExpiracion = new Date(this.itemTemporal.fechaExpiracionFormateada);
      const index = this.promociones.findIndex(p => p.id === this.itemTemporal.id);
      if (index !== -1) this.promociones[index] = { ...this.itemTemporal };
      else              this.promociones.push({ ...this.itemTemporal });
    } else {
      const index = this.menu.findIndex(m => m.id === this.itemTemporal.id);
      if (index !== -1) this.menu[index] = { ...this.itemTemporal };
      else              this.menu.push({ ...this.itemTemporal });
    }
    this.cerrarModal();
  }

  cerrarModal() {
    this.editandoItem = false;
    this.itemTemporal = {};
  }

  eliminarPromo(id: number) {
    this.ultimoItemEliminado = { ...this.promociones.find(p => p.id === id) };
    this.tipoItemEliminado   = 'promo';
    this.promociones         = this.promociones.filter(p => p.id !== id);
    this.mostrarNotificacionUndo();
  }

  eliminarMenu(id: number) {
    this.ultimoItemEliminado = { ...this.menu.find(m => m.id === id) };
    this.tipoItemEliminado   = 'menu';
    this.menu                = this.menu.filter(m => m.id !== id);
    this.mostrarNotificacionUndo();
  }

  mostrarNotificacionUndo() {
    this.mostrandoUndo = true;
    if (this.timerUndo) clearTimeout(this.timerUndo);
    this.timerUndo = setTimeout(() => this.mostrandoUndo = false, 5000);
  }

  deshacerEliminar() {
    if (this.tipoItemEliminado === 'promo') this.promociones.push(this.ultimoItemEliminado);
    else                                    this.menu.push(this.ultimoItemEliminado);
    this.mostrandoUndo = false;
    clearTimeout(this.timerUndo);
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/restaurant/login']);
  }

  formatCoord(val: number | null): string {
    return val === null ? '— no definida —' : val.toFixed(6);
  }
}