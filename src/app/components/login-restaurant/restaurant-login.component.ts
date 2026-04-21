import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoggerService} from '../../core/services/logger.service';
import { TranslateModule } from '@ngx-translate/core'; // IMPORTANTE
import { RestauranteService } from '../../core/services/restaurante.service';
import { catchError, forkJoin, map, of, take, timeout } from 'rxjs';

@Component({
  selector: 'app-restaurant-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule], // AGREGADO AQUÍ
  templateUrl: './restaurant-login.component.html',
  styleUrls: ['./restaurant-login.component.css'],
})
export class RestaurantLoginComponent {

  showPassword = false;
  email: string = '';
  password: string = '';
  errorMsg: string = '';
  cargando: boolean = false;

  constructor(
    public  router:   Router,
    private logger:   LoggerService,
    private restauranteService: RestauranteService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
    this.logger.info('Toggle password visibility', {
      visible: this.showPassword
    });
  }

  login() {
    this.errorMsg = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMsg = 'Ingresa correo y contraseña';
      return;
    }

    this.cargando = true;
    const normalizedEmail = this.email.trim().toLowerCase();
    this.logger.info('Intento de login', { email: normalizedEmail });

    this.restauranteService.login(normalizedEmail, this.password).subscribe({
      next: (data: any) => {
        this.logger.info('Login exitoso', { email: normalizedEmail });

        const resolvedUuid = `${data?.uuid ?? data?.restaurantId ?? data?.id ?? ''}`.trim();
        if (resolvedUuid) {
          localStorage.setItem('restaurant_uuid', resolvedUuid);
        }
        localStorage.setItem('restaurant_email', normalizedEmail);

        if (resolvedUuid) {
          this.navegarARestaurant();
          return;
        }

        this.resolverRestaurantUuidAntesDeNavegar(normalizedEmail);
      },
      error: (err) => {
        this.cargando = false;
        this.logger.error('Login fallido', { status: err?.status });

        if (err.status === 401) {
          this.errorMsg = 'Correo o contraseña incorrectos';
        } else if (err.status === 0) {
          this.errorMsg = 'No se pudo conectar con el servidor';
        } else {
          this.errorMsg = err?.error?.message || 'Error al iniciar sesión. Intenta nuevamente';
        }
      }
    });
  }

  goToRegister() {
    this.logger.info('Navegación a registro de restaurante');
    this.router.navigate(['/restaurant/register']);
  }

  private resolverRestaurantUuidAntesDeNavegar(normalizedEmail: string): void {
    this.restauranteService.getRestaurantes().subscribe({
      next: (restaurants: any[]) => {
        const list = Array.isArray(restaurants) ? restaurants : [];
        const byOwner = list.find((r: any) => {
          const owner = `${r?.ownerMail ?? r?.mail ?? r?.email ?? r?.owner_email ?? ''}`.trim().toLowerCase();
          return owner === normalizedEmail;
        });

        const resolvedByOwner = `${byOwner?.uuid ?? byOwner?.restaurantId ?? byOwner?.id ?? ''}`.trim();
        if (resolvedByOwner) {
          localStorage.setItem('restaurant_uuid', resolvedByOwner);
          this.navegarARestaurant();
          return;
        }

        if (list.length === 1) {
          const onlyUuid = `${list[0]?.uuid ?? list[0]?.restaurantId ?? list[0]?.id ?? ''}`.trim();
          if (onlyUuid) {
            localStorage.setItem('restaurant_uuid', onlyUuid);
          }
          this.navegarARestaurant();
          return;
        }

        const candidateIds = list
          .map((r: any) => `${r?.uuid ?? r?.restaurantId ?? r?.id ?? ''}`.trim())
          .filter((id: string) => !!id);

        if (!candidateIds.length) {
          this.navegarARestaurant();
          return;
        }

        const checks = candidateIds.map((id) =>
          this.restauranteService.getPromocionesPorRestaurante(id).pipe(
            take(1),
            timeout(5000),
            map((items: any[]) => ({ id, total: Array.isArray(items) ? items.length : 0 })),
            catchError(() => of({ id, total: 0 }))
          )
        );

        forkJoin(checks).pipe(take(1)).subscribe({
          next: (results) => {
            const resolved = results.find((x) => x.total > 0)?.id ?? '';
            if (resolved) {
              localStorage.setItem('restaurant_uuid', resolved);
            }
            this.navegarARestaurant();
          },
          error: () => this.navegarARestaurant()
        });
      },
      error: () => this.navegarARestaurant()
    });
  }

  private navegarARestaurant(): void {
    this.cargando = false;
    this.router.navigate(['/restaurant'], { replaceUrl: true });
  }
}