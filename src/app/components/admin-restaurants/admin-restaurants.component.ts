import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-restaurants',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './admin-restaurants.html',
  styleUrls: ['./admin-restaurants.css']
})
export class AdminRestaurantsComponent implements OnInit {

  constructor(
    private router: Router,
    private adminService: AdminService
  ) {}

  restaurantes: Array<{
    id: string;
    nombre: string;
    plan: string;
    tiempo: number;
    bloqueado: boolean;
  }> = [];

  cargando = false;
  errorMsg = '';

  ngOnInit(): void {
    this.cargarRestaurantes();
  }

  cargarRestaurantes(): void {
    this.cargando = true;
    this.errorMsg = '';

    this.adminService.getRestaurants().subscribe({
      next: (items: any) => {
        this.cargando = false;

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
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'No se pudieron cargar los restaurantes';
      }
    });
  }

  toggleBloqueo(r: any) {
    const newState = !r.bloqueado;

    this.adminService.updateRestaurantBlock(r.id, newState).subscribe({
      next: () => {
        r.bloqueado = newState;
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'No se pudo actualizar el bloqueo del restaurante';
      }
    });
  }

  irAdmin() {
    this.router.navigate(['/admin']);
  }

  cerrarSesion() {
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