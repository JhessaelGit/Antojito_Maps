import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AdminService } from '../../core/services/admin.service';
import { AdminSessionService } from '../../core/services/admin-session.service';

@Component({
  selector: 'app-admin-restaurants',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './admin-restaurants.html',
  styleUrls: ['./admin-restaurants.css']
})
export class AdminRestaurantsComponent implements OnInit {

  restaurantes: Array<{
    id: string;
    nombre: string;
    plan: string;
    tiempo: number;
    bloqueado: boolean;
  }> = [];

  cargando = false;
  errorMsg = '';

  constructor(
    private router: Router,
    private adminService: AdminService,
    private adminSession: AdminSessionService,
    private zone: NgZone,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarRestaurantes();
  }

  irAlInicio(): void {
    this.router.navigate(['/']);
  }

  cargarRestaurantes(): void {
    this.cargando = true;
    this.errorMsg = '';
    this.cd.detectChanges();

    this.adminService.getRestaurants().subscribe({
      next: (items: any) => {
        this.zone.run(() => {
          const rawList = Array.isArray(items) ? items : (items?.data ?? items?.restaurants ?? []);
          this.restaurantes = rawList
            .map((r: any) => ({
              id: `${r.uuid ?? r.id ?? ''}`,
              nombre: `${r.name ?? r.nombre ?? 'Restaurante'}`,
              plan: this.normalizePlan(r.planSuscription ?? r.plan ?? ''),
              tiempo: this.calculateRemainingDays(r.planExpirationDate),
              bloqueado: !!(r.isBlocked ?? r.bloqueado)
            }))
            .filter((r: any) => !!r.id);
          this.cargando = false;
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.cargando = false;
          this.errorMsg = err?.error?.message || 'No se pudieron cargar los restaurantes';
          this.cd.detectChanges();
        });
      }
    });
  }

  toggleBloqueo(r: any) {
    const newState = !r.bloqueado;

    this.adminService.updateRestaurantBlock(r.id, newState).subscribe({
      next: () => {
        this.zone.run(() => {
          r.bloqueado = newState;
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.errorMsg = err?.error?.message || 'No se pudo actualizar el bloqueo del restaurante';
          this.cd.detectChanges();
        });
      }
    });
  }

  irAdmin() {
    this.router.navigate(['/admin']);
  }

  cerrarSesion() {
    this.adminSession.clearSession();
    this.router.navigate(['/admin/login']);
  }

  private normalizePlan(plan: string): string {
    const value = `${plan}`.toUpperCase();
    if (value.includes('ANNUAL')) return 'PLAN_ANNUAL';
    if (value.includes('MONTH') || value.includes('MENSUAL') || value.includes('BASIC')) return 'PLAN_MONTHLY';
    return 'PLAN_NONE';
  }

  private calculateRemainingDays(expirationDate?: string): number {
    if (!expirationDate) return 0;

    const expiry = new Date(expirationDate);
    if (Number.isNaN(expiry.getTime())) return 0;

    const diffMs = expiry.getTime() - Date.now();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  get totalActivos(): number {
    return this.restaurantes.filter(r => !r.bloqueado).length;
  }

  get totalBloqueados(): number {
    return this.restaurantes.filter(r => r.bloqueado).length;
  }

  readonly Math = Math;
}