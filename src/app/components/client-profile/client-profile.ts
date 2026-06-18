import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

/* ─────────────────────────────────────────────────────────────────
   INTERFACES
───────────────────────────────────────────────────────────────── */
export interface MockUsuario {
  nombre: string;
  email: string;
  iniciales: string;
  miembroDesde: string;
}

export interface MockCupon {
  id: string;
  nombre: string;
  descuento: number | string;
  unidad: string;
  restauranteEmisor: string;
  restauranteCanje: string;
  fechaExpiracion: string;
  expiraPronto: boolean;
  estado?: 'activo' | 'usado' | 'expirado';
  fechaUso?: string;
  // ── Campos para el modal de canje ──
  uniqueCode?: string;
  qrUrl?: string;
}

export interface MockFidelizacion {
  puntosActuales: number;
  beneficiosDesbloqueados: string[];
  beneficiosBloqueados: string[];
}

export interface NivelConfig {
  key: string;
  icono: string;
  clase: string;
  ptsMin: number;
}

/* ─────────────────────────────────────────────────────────────────
   MOCK DATA (reemplazar con llamadas HTTP en siguiente fase)
───────────────────────────────────────────────────────────────── */
const MOCK_USUARIO: MockUsuario = {
  nombre: 'Valentina Torres',
  email: 'valentina.torres@gmail.com',
  iniciales: 'VT',
  miembroDesde: 'enero 2024',
};

const MOCK_CUPONES_PENDIENTES: MockCupon[] = [
  {
    id: 'c1',
    nombre: '2x1 en Pollos a la Brasa',
    descuento: '2x1',
    unidad: 'oferta',
    restauranteEmisor: 'Pollos Don Juan',
    restauranteCanje: 'Pollos Don Juan',
    fechaExpiracion: '14 jun 2026',
    expiraPronto: true,
    estado: 'activo',
    uniqueCode: 'ANT-8F3K9X',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=ANT-8F3K9X',
  },
  {
    id: 'c2',
    nombre: '15% de descuento en postres',
    descuento: 15,
    unidad: '%',
    restauranteEmisor: 'Pollos Don Juan',
    restauranteCanje: 'Heladería Doña María',
    fechaExpiracion: '30 jun 2026',
    expiraPronto: false,
    estado: 'activo',
    uniqueCode: 'ANT-2M7PQR',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=ANT-2M7PQR',
  },
  {
    id: 'c3',
    nombre: 'Bebida gratis con tu orden',
    descuento: 'FREE',
    unidad: 'drink',
    restauranteEmisor: 'Pizzería Roma',
    restauranteCanje: 'Pizzería Roma',
    fechaExpiracion: '25 jul 2026',
    expiraPronto: false,
    estado: 'activo',
    uniqueCode: 'ANT-LK04WZ',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=ANT-LK04WZ',
  },
];

const MOCK_CUPONES_HISTORIAL: MockCupon[] = [
  {
    id: 'h1',
    nombre: '10% en tu primer pedido',
    descuento: 10,
    unidad: '%',
    restauranteEmisor: 'Sushi Zen',
    restauranteCanje: 'Sushi Zen',
    fechaExpiracion: '01 may 2026',
    expiraPronto: false,
    estado: 'usado',
    fechaUso: '28 abr 2026',
  },
  {
    id: 'h2',
    nombre: 'Entrada gratis',
    descuento: 'FREE',
    unidad: 'entrada',
    restauranteEmisor: 'Parrilla El Gaucho',
    restauranteCanje: 'Parrilla El Gaucho',
    fechaExpiracion: '15 mar 2026',
    expiraPronto: false,
    estado: 'expirado',
    fechaUso: '15 mar 2026',
  },
];

const MOCK_FIDELIZACION: MockFidelizacion = {
  puntosActuales: 450,
  beneficiosDesbloqueados: [
    'FREE_DELIVERY',
    'BIRTHDAY_COUPON',
    'PRIORITY_SUPPORT',
  ],
  beneficiosBloqueados: [
    'VIP_EVENTS',
    'PERSONAL_CHEF',
    'MONTHLY_BOX',
  ],
};

const NIVELES_CONFIG: NivelConfig[] = [
  { key: 'BRONZE', icono: '🥉', clase: 'level-bronze', ptsMin: 0 },
  { key: 'SILVER', icono: '🥈', clase: 'level-silver', ptsMin: 300 },
  { key: 'GOLD',   icono: '🥇', clase: 'level-gold',   ptsMin: 700 },
];

/* ─────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────── */
@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './client-profile.html',
  styleUrls: ['./client-profile.css'],
})
export class ClientProfileComponent implements OnInit {

  /* Mock data expuesto al template */
  readonly mockUsuario: MockUsuario = MOCK_USUARIO;
  readonly mockFidelizacion: MockFidelizacion = MOCK_FIDELIZACION;
  readonly nivelesConfig: NivelConfig[] = NIVELES_CONFIG;

  cuponesPendientes: MockCupon[] = MOCK_CUPONES_PENDIENTES;
  cuponesHistorial: MockCupon[] = MOCK_CUPONES_HISTORIAL;

  cuponSeleccionado: MockCupon | null = null;
  modalCanjeAbierto: boolean = false;

  /** Tab activa en la billetera: 'pending' | 'history' */
  tabActiva: 'pending' | 'history' = 'pending';

  /* Niveles calculados */
  nivelActual!: NivelConfig;
  indiceNivelActual!: number;
  siguienteNivel: NivelConfig | null = null;
  porcentajeProgreso: number = 0;
  puntosParaSiguienteNivel: number = 0;

  /* Beneficios */
  beneficiosDesbloqueados: string[] = [];
  beneficiosBloqueados: string[]    = [];

  get cuponesActivos(): number {
    return this.cuponesPendientes.filter(c => c.estado === 'activo').length;
  }

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.calcularNivel();
    this.beneficiosDesbloqueados = this.mockFidelizacion.beneficiosDesbloqueados;
    this.beneficiosBloqueados    = this.mockFidelizacion.beneficiosBloqueados;
  }

  /* ── Navegación ─────────────────────────────────────────────── */
  volver(): void {
    this.router.navigate(['/mapa']);
  }

  irAlMapa(): void {
    this.router.navigate(['/mapa']);
  }

  /* ── Lógica de nivel ────────────────────────────────────────── */
  private calcularNivel(): void {
    const pts = this.mockFidelizacion.puntosActuales;

    // Encontrar nivel actual (el más alto alcanzado)
    let idx = 0;
    for (let i = NIVELES_CONFIG.length - 1; i >= 0; i--) {
      if (pts >= NIVELES_CONFIG[i].ptsMin) {
        idx = i;
        break;
      }
    }

    this.indiceNivelActual = idx;
    this.nivelActual       = NIVELES_CONFIG[idx];

    if (idx < NIVELES_CONFIG.length - 1) {
      this.siguienteNivel = NIVELES_CONFIG[idx + 1];
      const rango = this.siguienteNivel.ptsMin - this.nivelActual.ptsMin;
      const avance = pts - this.nivelActual.ptsMin;
      this.porcentajeProgreso      = Math.min(100, Math.round((avance / rango) * 100));
      this.puntosParaSiguienteNivel = this.siguienteNivel.ptsMin - pts;
    } else {
      this.siguienteNivel          = null;
      this.porcentajeProgreso      = 100;
      this.puntosParaSiguienteNivel = 0;
    }
  }

  /* ── Acciones ───────────────────────────────────────────────── */

  mostrarParaCanjear(cupon: MockCupon): void {
    this.cuponSeleccionado = cupon;
    this.modalCanjeAbierto = true;
    // Bloquear scroll del body mientras el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  cerrarModalCanje(): void {
    this.modalCanjeAbierto = false;
    this.cuponSeleccionado = null;
    document.body.style.overflow = '';
  }
onQrError(event: Event): void {
  // Si la imagen del QR falla, mostramos un placeholder SVG inline
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  const parent = img.parentElement;
  if (parent && !parent.querySelector('.canje-qr-fallback')) {
    const fallback = document.createElement('div');
    fallback.className = 'canje-qr-fallback';
    fallback.innerHTML = `
      <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
        <rect width="180" height="180" fill="#f4f1ec" rx="8"/>
        <rect x="10" y="10" width="60" height="60" fill="none" stroke="#02332d" stroke-width="6" rx="4"/>
        <rect x="22" y="22" width="36" height="36" fill="#02332d" rx="2"/>
        <rect x="110" y="10" width="60" height="60" fill="none" stroke="#02332d" stroke-width="6" rx="4"/>
        <rect x="122" y="22" width="36" height="36" fill="#02332d" rx="2"/>
        <rect x="10" y="110" width="60" height="60" fill="none" stroke="#02332d" stroke-width="6" rx="4"/>
        <rect x="22" y="122" width="36" height="36" fill="#02332d" rx="2"/>
        <rect x="110" y="110" width="20" height="20" fill="#02332d" rx="2"/>
        <rect x="140" y="110" width="20" height="20" fill="#02332d" rx="2"/>
        <rect x="110" y="140" width="20" height="20" fill="#02332d" rx="2"/>
        <rect x="140" y="140" width="20" height="20" fill="#02332d" rx="2"/>
        <rect x="80" y="10" width="12" height="12" fill="#02332d" rx="1"/>
        <rect x="80" y="30" width="12" height="12" fill="#02332d" rx="1"/>
        <rect x="80" y="50" width="12" height="12" fill="#02332d" rx="1"/>
        <rect x="10" y="80" width="12" height="12" fill="#02332d" rx="1"/>
        <rect x="30" y="80" width="12" height="12" fill="#02332d" rx="1"/>
        <rect x="50" y="80" width="12" height="12" fill="#02332d" rx="1"/>
        <rect x="80" y="80" width="12" height="12" fill="#02332d" rx="1"/>
        <rect x="100" y="80" width="12" height="12" fill="#02332d" rx="1"/>
        <rect x="120" y="80" width="12" height="12" fill="#02332d" rx="1"/>
        <rect x="140" y="80" width="12" height="12" fill="#02332d" rx="1"/>
        <rect x="160" y="80" width="12" height="12" fill="#02332d" rx="1"/>
      </svg>`;
    parent.appendChild(fallback);
  }
}
}