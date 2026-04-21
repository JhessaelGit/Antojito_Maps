import { Component, OnInit, OnDestroy, AfterViewInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  CreatePromotionRequest,
  PromotionResponse,
  RestauranteService
} from '../../core/services/restaurante.service';
import { Subscription, catchError, finalize, forkJoin, map, of, take, timeout } from 'rxjs';
import * as L from 'leaflet';

@Component({
  selector: 'app-restaurant-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './restaurant-page.html',
  styleUrl: './restaurant-page.css',
})
export class RestaurantPage implements OnInit, OnDestroy, AfterViewInit {

  restaurantImage: string | null = null;
  restaurantName = '';
  restaurantCategory = '';
  restaurantLat: number | null = null;
  restaurantLng: number | null = null;

  get selectedPlan(): string {
    return localStorage.getItem('selected_plan') || '';
  }

  vistaActiva: 'promos' | 'menu' | 'perfil' = 'promos';

  promociones: PromotionResponse[] = [];
  menu: any[] = [];

  editandoItem = false;
  esPromo = false;
  itemTemporal: any = {};
  mostrandoUndo = false;
  ultimoItemEliminado: any = null;
  tipoItemEliminado: 'promo' | 'menu' | null = null;
  errorMsg = '';
  cargandoPromociones = false;
  guardandoPromocion = false;
  promocionesErrorMsg = '';

  perfilNombre = '';
  perfilCategoria = '';
  perfilDescripcion = '';
  perfilImagePreview: string | null = null;
  perfilImageFile: File | null = null;
  guardandoPerfil = false;

  private mapaUbicacion?: L.Map;
  private mapaMarker?: L.Marker;
  mapaListo = false;

  private restaurantUuid: string | null = null;
  private ownerMail: string | null = null;
  private promocionesLoadSub?: Subscription;
  private promocionesSafetyTimer: any;
  private guardadoSafetyTimer: any;
  private timerUndo: any;

  constructor(
    public router: Router,
    private restauranteService: RestauranteService,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.restaurantUuid = localStorage.getItem('restaurant_uuid');
    this.ownerMail = localStorage.getItem('restaurant_email')?.trim().toLowerCase() ?? null;

    if (this.restaurantUuid) {
      this.cargarRestaurantePorId(this.restaurantUuid);
      this.cargarPromociones(true);
    } else {
      this.cargandoPromociones = true;
      this.resolverRestauranteDeSesion();
    }
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    if (this.timerUndo) clearTimeout(this.timerUndo);
    if (this.promocionesSafetyTimer) clearTimeout(this.promocionesSafetyTimer);
    if (this.guardadoSafetyTimer) clearTimeout(this.guardadoSafetyTimer);
    this.promocionesLoadSub?.unsubscribe();
    this.mapaUbicacion?.remove();
  }

  cambiarVista(vista: 'promos' | 'menu' | 'perfil'): void {
    this.vistaActiva = vista;

    if (vista === 'promos') {
      this.cargarPromociones(true);
    }

    if (vista === 'perfil') {
      setTimeout(() => this.initMapaPerfil(), 200);
    }
  }

  crearPromo(): void {
    this.esPromo = true;
    this.errorMsg = '';

    const hoy = this.formatDateForApi(new Date());
    this.itemTemporal = {
      title: '',
      description: '',
      percentDiscount: 0,
      dateStartPromotion: hoy,
      dateEndPromotion: hoy,
      isActivePromotion: true
    };

    this.editandoItem = true;
  }

  crearMenu(): void {
    this.esPromo = false;
    this.itemTemporal = { id: Date.now(), nombre: '', descripcion: '', precio: 0 };
    this.editandoItem = true;
  }

  editarMenu(item: any): void {
    this.esPromo = false;
    this.itemTemporal = { ...item };
    this.editandoItem = true;
  }

  guardarCambios(): void {
    if (this.esPromo) {
      this.guardarNuevaPromocion();
      return;
    }

    const index = this.menu.findIndex((m) => m.id === this.itemTemporal.id);
    if (index !== -1) {
      this.menu[index] = { ...this.itemTemporal };
    } else {
      this.menu.push({ ...this.itemTemporal });
    }

    this.cerrarModal();
  }

  cerrarModal(): void {
    this.editandoItem = false;
    this.itemTemporal = {};
    this.errorMsg = '';
  }

  eliminarMenu(id: number): void {
    this.ultimoItemEliminado = { ...this.menu.find((m) => m.id === id) };
    this.tipoItemEliminado = 'menu';
    this.menu = this.menu.filter((m) => m.id !== id);
    this.mostrarNotificacionUndo();
  }

  mostrarNotificacionUndo(): void {
    this.mostrandoUndo = true;
    if (this.timerUndo) clearTimeout(this.timerUndo);
    this.timerUndo = setTimeout(() => (this.mostrandoUndo = false), 5000);
  }

  deshacerEliminar(): void {
    if (this.tipoItemEliminado === 'promo') {
      this.promociones.push(this.ultimoItemEliminado);
    } else {
      this.menu.push(this.ultimoItemEliminado);
    }

    this.mostrandoUndo = false;
    clearTimeout(this.timerUndo);
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/restaurant/login']);
  }

  onPerfilFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.procesarImagenPerfil(input.files[0]);
  }

  onPerfilDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.procesarImagenPerfil(file);
  }

  quitarImagenPerfil(event: Event): void {
    event.stopPropagation();
    this.perfilImageFile = null;
    this.perfilImagePreview = null;
  }

  guardarPerfil(): void {
    this.guardandoPerfil = true;
    this.restaurantName = this.perfilNombre;
    this.restaurantCategory = this.perfilCategoria;

    if (this.perfilImagePreview) {
      this.restaurantImage = this.perfilImagePreview;
      localStorage.setItem('restaurant_image', this.perfilImagePreview);
    }

    localStorage.setItem('restaurant_name', this.perfilNombre);
    localStorage.setItem('restaurant_category', this.perfilCategoria);

    setTimeout(() => {
      this.guardandoPerfil = false;
      this.cd.detectChanges();
    }, 800);
  }

  formatCoord(val: number | null): string {
    return val === null ? 'no definida' : val.toFixed(6);
  }

  private resolverRestauranteDeSesion(): void {
    if (!this.ownerMail) {
      this.cargarDesdeLocalStorage();
      this.promocionesErrorMsg = this.translate.instant('OWNER.ERR_PROMO_CONTEXT');
      this.cargandoPromociones = false;
      return;
    }

    this.restauranteService.getRestaurantes().subscribe({
      next: (restaurants: any[]) => {
        const list = Array.isArray(restaurants) ? restaurants : [];

        const matchByOwner = list.find((r: any) => {
          const owner = `${r?.ownerMail ?? r?.mail ?? r?.email ?? r?.owner_email ?? ''}`.trim().toLowerCase();
          return owner === this.ownerMail;
        });

        const idByOwner = `${matchByOwner?.uuid ?? matchByOwner?.restaurantId ?? matchByOwner?.id ?? ''}`.trim();
        if (idByOwner) {
          this.asignarRestaurantUuid(idByOwner);
          return;
        }

        if (list.length === 1) {
          const onlyId = `${list[0]?.uuid ?? list[0]?.restaurantId ?? list[0]?.id ?? ''}`.trim();
          if (onlyId) {
            this.asignarRestaurantUuid(onlyId);
            return;
          }
        }

        this.resolverRestaurantPorPromos(list);
      },
      error: () => {
        this.cargarDesdeLocalStorage();
        this.promocionesErrorMsg = this.translate.instant('OWNER.ERR_PROMO_LOAD');
        this.cargandoPromociones = false;
      }
    });
  }

  private resolverRestaurantPorPromos(restaurants: any[]): void {
    const candidateIds = (restaurants ?? [])
      .map((r: any) => `${r?.uuid ?? r?.restaurantId ?? r?.id ?? ''}`.trim())
      .filter((id: string) => !!id);

    if (!candidateIds.length) {
      this.cargarDesdeLocalStorage();
      this.promocionesErrorMsg = this.translate.instant('OWNER.ERR_PROMO_NO_RESTAURANT');
      this.cargandoPromociones = false;
      return;
    }

    const checks = candidateIds.map((id) =>
      this.restauranteService.getPromocionesPorRestaurante(id).pipe(
        take(1),
        timeout(6000),
        map((items) => ({ id, total: this.normalizePromociones(items).length })),
        catchError(() => of({ id, total: 0 }))
      )
    );

    forkJoin(checks)
      .pipe(take(1))
      .subscribe((results) => {
        const resolvedId = results.find((x) => x.total > 0)?.id ?? '';

        if (!resolvedId) {
          this.cargarDesdeLocalStorage();
          this.promocionesErrorMsg = this.translate.instant('OWNER.ERR_PROMO_NO_RESTAURANT');
          this.cargandoPromociones = false;
          return;
        }

        this.asignarRestaurantUuid(resolvedId);
      });
  }

  private asignarRestaurantUuid(restaurantId: string): void {
    this.restaurantUuid = restaurantId;
    localStorage.setItem('restaurant_uuid', restaurantId);
    this.cargarRestaurantePorId(restaurantId);
    this.cargarPromociones(true);
  }

  private cargarRestaurantePorId(restaurantId: string): void {
    this.restauranteService.getRestauranteById(restaurantId).subscribe({
      next: (data: any) => {
        this.restaurantName = data.name ?? localStorage.getItem('restaurant_name') ?? '';
        this.restaurantCategory = data.category ?? localStorage.getItem('restaurant_category') ?? '';
        this.restaurantImage = data.imagenUrl ?? data.image_url ?? localStorage.getItem('restaurant_image');
        this.restaurantLat = data.latitude ?? null;
        this.restaurantLng = data.longitude ?? null;
        this.sincronizarPerfil();
        this.cd.detectChanges();
      },
      error: () => {
        this.cargarDesdeLocalStorage();
        this.cd.detectChanges();
      }
    });
  }

  private cargarPromociones(showLoader: boolean): void {
    if (!this.restaurantUuid) {
      this.promociones = [];
      this.cargandoPromociones = false;
      this.promocionesErrorMsg = this.translate.instant('OWNER.ERR_PROMO_CONTEXT');
      return;
    }

    this.promocionesLoadSub?.unsubscribe();
    if (this.promocionesSafetyTimer) clearTimeout(this.promocionesSafetyTimer);

    if (showLoader) {
      this.cargandoPromociones = true;
      this.promociones = [];
    }

    this.promocionesErrorMsg = '';
    this.promocionesSafetyTimer = setTimeout(() => {
      this.cargandoPromociones = false;
    }, 15000);

    this.promocionesLoadSub = this.restauranteService.getPromocionesPorRestaurante(this.restaurantUuid)
      .pipe(
        take(1),
        timeout(12000),
        map((items) => this.normalizePromociones(items)),
        finalize(() => {
          this.cargandoPromociones = false;
          if (this.promocionesSafetyTimer) {
            clearTimeout(this.promocionesSafetyTimer);
            this.promocionesSafetyTimer = null;
          }
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: (items) => {
          this.promociones = items;
          this.cd.detectChanges();
        },
        error: (err) => {
          this.promociones = [];
          if (err?.status === 404) {
            this.promocionesErrorMsg = err?.error?.message || this.translate.instant('OWNER.ERR_PROMO_NO_RESTAURANT');
          } else {
            this.promocionesErrorMsg = err?.error?.message || this.translate.instant('OWNER.ERR_PROMO_LOAD');
          }
          this.cd.detectChanges();
        }
      });
  }

  private guardarNuevaPromocion(): void {
    this.errorMsg = '';

    if (!this.restaurantUuid || !this.ownerMail) {
      this.errorMsg = this.translate.instant('OWNER.ERR_PROMO_CONTEXT');
      return;
    }

    if (this.guardandoPromocion) {
      return;
    }

    const title = `${this.itemTemporal.title ?? ''}`.trim();
    const description = `${this.itemTemporal.description ?? ''}`.trim();
    const percentDiscount = Number(this.itemTemporal.percentDiscount);
    const dateStartPromotion = `${this.itemTemporal.dateStartPromotion ?? ''}`.trim();
    const dateEndPromotion = `${this.itemTemporal.dateEndPromotion ?? ''}`.trim();

    if (!title) {
      this.errorMsg = this.translate.instant('OWNER.ERR_PROMO_TITLE');
      return;
    }

    if (!Number.isFinite(percentDiscount) || percentDiscount < 0 || percentDiscount > 100) {
      this.errorMsg = this.translate.instant('OWNER.ERR_PROMO_DISCOUNT');
      return;
    }

    if (!dateStartPromotion || !dateEndPromotion) {
      this.errorMsg = this.translate.instant('OWNER.ERR_PROMO_DATES');
      return;
    }

    if (dateEndPromotion < dateStartPromotion) {
      this.errorMsg = this.translate.instant('OWNER.ERR_PROMO_DATE_ORDER');
      return;
    }

    const payload: CreatePromotionRequest = {
      ownerMail: this.ownerMail,
      title,
      description: description || undefined,
      percentDiscount,
      dateStartPromotion,
      dateEndPromotion,
      isActivePromotion: this.itemTemporal.isActivePromotion ?? true
    };

    const optimisticUuid = `tmp-${Date.now()}`;
    const optimisticPromo: PromotionResponse = {
      uuid: optimisticUuid,
      restaurantId: this.restaurantUuid,
      title,
      description: description || undefined,
      percentDiscount,
      dateStartPromotion,
      dateEndPromotion,
      isActivePromotion: payload.isActivePromotion ?? true
    };

    this.promocionesErrorMsg = '';
    this.promociones = [optimisticPromo, ...this.promociones.filter((p) => p.uuid !== optimisticUuid)];
    this.cerrarModal();

    this.guardandoPromocion = true;
    if (this.guardadoSafetyTimer) clearTimeout(this.guardadoSafetyTimer);
    this.guardadoSafetyTimer = setTimeout(() => {
      this.guardandoPromocion = false;
    }, 15000);

    this.restauranteService.crearPromocion(this.restaurantUuid, payload)
      .pipe(
        take(1),
        timeout(12000),
        finalize(() => {
          this.guardandoPromocion = false;
          if (this.guardadoSafetyTimer) {
            clearTimeout(this.guardadoSafetyTimer);
            this.guardadoSafetyTimer = null;
          }
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: (created) => {
          const normalized = this.normalizePromociones([created]);
          if (normalized.length) {
            const promo = normalized[0];
            this.promociones = [
              promo,
              ...this.promociones.filter((p) => p.uuid !== optimisticUuid && p.uuid !== promo.uuid)
            ];
          } else {
            this.promociones = this.promociones.filter((p) => p.uuid !== optimisticUuid);
          }

          this.cargarPromociones(false);
        },
        error: (err) => {
          this.promociones = this.promociones.filter((p) => p.uuid !== optimisticUuid);
          this.promocionesErrorMsg = err?.error?.message || this.translate.instant('OWNER.ERR_PROMO_CREATE');
          this.cargarPromociones(false);
          this.cd.detectChanges();
        }
      });
  }

  private normalizePromociones(raw: any): PromotionResponse[] {
    const source = Array.isArray(raw)
      ? raw
      : (Array.isArray(raw?.items) ? raw.items : []);

    return source
      .map((p: any) => {
        const uuid = `${p?.uuid ?? p?.promotionId ?? p?.promotion_id ?? ''}`.trim();
        const restaurantId = `${p?.restaurantId ?? p?.id_restaurant ?? p?.restaurant_id ?? ''}`.trim();
        const title = `${p?.title ?? p?.name ?? ''}`.trim();
        const dateStartPromotion = `${p?.dateStartPromotion ?? p?.date_start_promotion ?? ''}`.trim();
        const dateEndPromotion = `${p?.dateEndPromotion ?? p?.date_end_promotion ?? ''}`.trim();
        const percentDiscount = Number(p?.percentDiscount ?? p?.percent_discount ?? p?.discount ?? 0);

        return {
          uuid,
          restaurantId,
          title,
          description: `${p?.description ?? p?.descripcion ?? ''}`.trim() || undefined,
          percentDiscount: Number.isFinite(percentDiscount) ? percentDiscount : 0,
          dateStartPromotion,
          dateEndPromotion,
          isActivePromotion: Boolean(p?.isActivePromotion ?? p?.is_active_promotion ?? true)
        } as PromotionResponse;
      })
      .filter((p: PromotionResponse) => !!p.uuid && !!p.restaurantId && !!p.title);
  }

  private cargarDesdeLocalStorage(): void {
    this.restaurantImage = localStorage.getItem('restaurant_image');
    this.restaurantName = localStorage.getItem('restaurant_name') ?? '';
    this.restaurantCategory = localStorage.getItem('restaurant_category') ?? '';
    this.sincronizarPerfil();
  }

  private sincronizarPerfil(): void {
    this.perfilNombre = this.restaurantName;
    this.perfilCategoria = this.restaurantCategory;
    this.perfilImagePreview = this.restaurantImage;
  }

  private initMapaPerfil(): void {
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
      html: '<div style="width:24px;height:24px;background:#7F1100;border:3px solid #BF9861;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(127,17,0,0.5);"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      className: ''
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

  private procesarImagenPerfil(file: File): void {
    if (file.size > 5 * 1024 * 1024) return;

    this.perfilImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.perfilImagePreview = e.target?.result as string;
      this.cd.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
