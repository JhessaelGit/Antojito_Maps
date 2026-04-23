import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RestauranteService } from '../../core/services/restaurante.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, finalize, takeUntil, timeout } from 'rxjs';

@Component({
  selector: 'app-restaurant-view',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './restaurant-view.html',
  styleUrl: './restaurant-view.css'
})
export class RestaurantView implements OnInit, OnDestroy {

  restaurante: any = null;
  cargando = true;
  error    = false;
  private readonly destroy$ = new Subject<void>();

  promociones: any[] = [
    { id: 1, nombre: 'Combo Especial',  descripcion: 'Papas + Arroz + 2 Presas + Refresco', precio: 21.6,  descuento: '10%' },
    { id: 2, nombre: 'Duo Pack',        descripcion: 'Ideal para compartir — 2 platos + 2 bebidas',       precio: 45, descuento: '15%' }
  ];

  constructor(
    private route:   ActivatedRoute,
    private router:  Router,
    private restauranteService: RestauranteService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    const uuid = this.route.snapshot.paramMap.get('uuid') ?? this.route.snapshot.paramMap.get('id');
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

  cargar(id: string) {
    this.cargando = true;
    this.error = false;
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

  private refreshView(): void {
    try {
      this.cd.detectChanges();
    } catch {
      // No-op: evita errores de detección al navegar rápidamente entre vistas.
    }
  }

  volverAlMapa() {
    this.router.navigate(['/mapa']);
  }
}