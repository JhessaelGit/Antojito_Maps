import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AdminSessionService } from '../../core/services/admin-session.service';
import { AdminService } from '../../core/services/admin.service';
import { environment } from '../../../environments/environment';
import { finalize } from 'rxjs';

export interface Complaint {
  uuid: string;
  type: 'RESTAURANT' | 'PROMOTION';
  targetUuid: string;
  targetName?: string;
  targetCategory?: string;
  description: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt?: string;
}

type Tab = 'pending' | 'all' | 'blocked_restaurants' | 'blocked_promotions';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-requests.html',
  styleUrl: './admin-requests.css'
})
export class AdminRequestsComponent implements OnInit {

  activeTab: Tab = 'pending';

  // Quejas
  quejasPendientes: Complaint[] = [];
  quejasAll: Complaint[] = [];
  cargandoQuejas = false;
  quejaError = '';

  // Restaurantes bloqueados
  restaurantesBloqueados: any[] = [];
  cargandoRestaurantes = false;

  // Modal
  modalVisible = false;
  quejaSeleccionada: Complaint | null = null;
  accionando = false;
  accionError = '';

  constructor(
    private location: Location,
    public router: Router,
    private http: HttpClient,
    private adminSession: AdminSessionService,
    private adminService: AdminService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarQuejasPendientes();
    this.cargarTodasQuejas();
    this.cargarRestaurantesBloqueados();
  }

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Admin-Id': this.adminSession.getAdminId() ?? ''
    });
  }

  volverAtras(): void { this.location.back(); }

  setTab(tab: Tab): void {
    this.activeTab = tab;
    this.cd.detectChanges();
  }

  // ── Carga de datos ──────────────────────────

  cargarQuejasPendientes(): void {
    this.cargandoQuejas = true;
    this.quejaError = '';
    this.http.get<Complaint[]>(`${environment.apiBaseUrl}/complaint/admin/pending`, { headers: this.headers })
      .pipe(finalize(() => { this.cargandoQuejas = false; this.cd.detectChanges(); }))
      .subscribe({
        next: (data) => { this.quejasPendientes = data ?? []; },
        error: (e) => { this.quejaError = e?.error?.message || 'Error al cargar quejas pendientes'; }
      });
  }

  cargarTodasQuejas(): void {
    this.http.get<Complaint[]>(`${environment.apiBaseUrl}/complaint/admin/all`, { headers: this.headers })
      .subscribe({
        next: (data) => { this.quejasAll = data ?? []; this.cd.detectChanges(); },
        error: () => {}
      });
  }

  cargarRestaurantesBloqueados(): void {
    this.cargandoRestaurantes = true;
    this.adminService.getRestaurants()
      .pipe(finalize(() => { this.cargandoRestaurantes = false; this.cd.detectChanges(); }))
      .subscribe({
        next: (items: any) => {
          const raw = Array.isArray(items) ? items : (items?.data ?? []);
          this.restaurantesBloqueados = raw
            .filter((r: any) => !!(r.isBlocked ?? r.bloqueado))
            .map((r: any) => ({
              uuid: r.uuid ?? r.id ?? '',
              name: r.name ?? r.nombre ?? 'Restaurante',
              category: r.category ?? r.categoria ?? '',
              plan: r.planSuscription ?? ''
            }));
        },
        error: () => {}
      });
  }

  // ── Acciones sobre quejas ───────────────────

  abrirModal(q: Complaint): void {
    this.quejaSeleccionada = q;
    this.modalVisible = true;
    this.accionError = '';
    this.cd.detectChanges();
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.quejaSeleccionada = null;
    this.cd.detectChanges();
  }

  revisar(status: 'ACCEPTED' | 'REJECTED'): void {
    if (!this.quejaSeleccionada || this.accionando) return;
    this.accionando = true;
    this.accionError = '';

    this.http.post<Complaint>(
      `${environment.apiBaseUrl}/complaint/admin/review/${this.quejaSeleccionada.uuid}`,
      { status },
      { headers: this.headers }
    ).pipe(finalize(() => { this.accionando = false; this.cd.detectChanges(); }))
    .subscribe({
      next: (updated) => {
        // Actualizar en ambas listas
        this.quejasPendientes = this.quejasPendientes.filter(q => q.uuid !== updated.uuid);
        const idx = this.quejasAll.findIndex(q => q.uuid === updated.uuid);
        if (idx !== -1) this.quejasAll[idx] = updated;
        if (status === 'ACCEPTED') this.cargarRestaurantesBloqueados();
        this.cerrarModal();
      },
      error: (e) => { this.accionError = e?.error?.message || 'Error al procesar la solicitud'; }
    });
  }

  desbloquearRestaurante(uuid: string): void {
    this.adminService.updateRestaurantBlock(uuid, false).subscribe({
      next: () => {
        this.restaurantesBloqueados = this.restaurantesBloqueados.filter(r => r.uuid !== uuid);
        this.cd.detectChanges();
      },
      error: () => {}
    });
  }

  get quejasActivas(): Complaint[] {
    return this.activeTab === 'pending' ? this.quejasPendientes : this.quejasAll;
  }

  statusLabel(s: string): string {
    return s === 'PENDING' ? 'Pendiente' : s === 'ACCEPTED' ? 'Aceptada' : 'Rechazada';
  }

  typeLabel(t: string): string {
    return t === 'RESTAURANT' ? 'Restaurante' : 'Promoción';
  }

  formatDate(d?: string): string {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('es-BO', { day:'2-digit', month:'short', year:'numeric' }); }
    catch { return d; }
  }
}