import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PromotionResponse, RestauranteService } from '../../core/services/restaurante.service';
import { ClientSessionService } from '../../core/services/client-session.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, finalize, takeUntil, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

interface RestaurantViewPromotion {
  uuid: string;
  title: string;
  description?: string;
  percentDiscount: number;
  dateStartPromotion?: string;
  dateEndPromotion?: string;
}

@Component({
  selector: 'app-restaurant-view',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './restaurant-view.html',
  styleUrl: './restaurant-view.css'
})
export class RestaurantView implements OnInit, OnDestroy {

  restaurante: any = null;
  cargando = true;
  error = false;
  cargandoPromociones = false;
  promocionesError = false;
  promociones: RestaurantViewPromotion[] = [];

  // Queja
  mostrarFormQueja = false;
  quejaEnviando = false;
  quejaTexto = '';
  quejaExito = false;
  quejaError = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restauranteService: RestauranteService,
    public clientSession: ClientSessionService,
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    const uuid = this.route.snapshot.paramMap.get('uuid') ?? this.route.snapshot.paramMap.get('id');
    this.mostrarFormQueja = this.route.snapshot.queryParamMap.get('report') === '1';

    if (uuid) {
      this.cargar(uuid);
    } else {
      this.error = true;
      this.cargando = false;
      this.refreshView();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargar(id: string): void {
    this.cargando = true;
    this.error = false;
    this.promociones = [];
    this.cargarPromociones(id);

    this.restauranteService
      .getRestauranteById(id)
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
          this.restaurante = data?.data ?? data;
          this.error = false;
        },
        error: () => {
          this.error = true;
        }
      });
  }

  formatDiscount(value: number): string {
    return Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(/\.?0+$/, '');
  }

  volverAlMapa(): void {
    this.router.navigate(['/mapa']);
  }

  iniciarSesionParaQueja(): void {
    this.router.navigate(['/client/login'], { queryParams: { returnUrl: this.router.url } });
  }

  registrarseParaQueja(): void {
    this.router.navigate(['/client/register'], { queryParams: { returnUrl: this.router.url } });
  }

  toggleFormQueja(): void {
    this.mostrarFormQueja = !this.mostrarFormQueja;
    this.quejaExito = false;
    this.quejaError = '';
    this.quejaTexto = '';
    this.refreshView();
  }

  enviarQueja(): void {
    if (!this.quejaTexto.trim()) {
      this.quejaError = 'Por favor describe el problema.';
      return;
    }
    if (!this.restaurante?.uuid) {
      this.quejaError = 'No se pudo identificar el restaurante.';
      return;
    }
    const clientId = this.clientSession.getClientId();
    if (!clientId) {
      this.quejaError = 'Debes iniciar sesión para enviar una queja.';
      return;
    }

    this.quejaEnviando = true;
    this.quejaError = '';

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Client-Id': clientId
    });

    this.http.post<any>(
      `${environment.apiBaseUrl}/complaint/create`,
      {
        type: 'RESTAURANT',
        targetUuid: this.restaurante.uuid,
        description: this.quejaTexto.trim()
      },
      { headers }
    ).subscribe({
      next: () => {
        this.quejaEnviando = false;
        this.quejaExito = true;
        this.quejaTexto = '';
        this.mostrarFormQueja = false;
        this.refreshView();
      },
      error: () => {
        this.quejaEnviando = false;
        this.quejaError = 'Error al enviar la queja. Intenta de nuevo.';
        this.refreshView();
      }
    });
  }

  private cargarPromociones(restaurantId: string): void {
    this.cargandoPromociones = true;
    this.promocionesError = false;

    this.restauranteService
      .getPromocionesPorRestaurante(restaurantId)
      .pipe(
        timeout(15000),
        takeUntil(this.destroy$),
        finalize(() => {
          this.cargandoPromociones = false;
          this.refreshView();
        })
      )
      .subscribe({
        next: (items: PromotionResponse[] | any) => {
          this.promociones = this.normalizarPromociones(items);
        },
        error: () => {
          this.promociones = [];
          this.promocionesError = true;
        }
      });
  }

  private normalizarPromociones(raw: any): RestaurantViewPromotion[] {
    const source = Array.isArray(raw)
      ? raw
      : (Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.items) ? raw.items : []);

    return source
      .map((p: any) => {
        const uuid = `${p?.uuid ?? p?.promotionId ?? p?.promotion_id ?? ''}`.trim();
        const title = `${p?.title ?? p?.name ?? p?.nombre ?? ''}`.trim();
        const percentDiscount = Number(p?.percentDiscount ?? p?.percent_discount ?? p?.discount ?? 0);

        return {
          uuid,
          title,
          description: `${p?.description ?? p?.descripcion ?? ''}`.trim() || undefined,
          percentDiscount: Number.isFinite(percentDiscount) ? percentDiscount : 0,
          dateStartPromotion: `${p?.dateStartPromotion ?? p?.date_start_promotion ?? ''}`.trim() || undefined,
          dateEndPromotion: `${p?.dateEndPromotion ?? p?.date_end_promotion ?? ''}`.trim() || undefined
        };
      })
      .filter((p: RestaurantViewPromotion) => !!p.uuid && !!p.title);
  }

  private refreshView(): void {
    try {
      this.cd.detectChanges();
    } catch {
      // No-op
    }
  }
}
