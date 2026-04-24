import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoggerService} from '../../core/services/logger.service';
import { TranslateModule } from '@ngx-translate/core'; // IMPORTANTE
import { RestaurantLoginResponse, RestauranteService } from '../../core/services/restaurante.service';

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
      next: (data: RestaurantLoginResponse) => {
        this.logger.info('Login exitoso', { email: normalizedEmail });
        const ownerId = `${data?.ownerId ?? ''}`.trim();
        const loginMail = `${data?.mail ?? normalizedEmail}`.trim().toLowerCase();
        const restaurantIds = Array.isArray(data?.restaurantIds)
          ? data.restaurantIds.map((id) => `${id ?? ''}`.trim()).filter((id) => !!id)
          : [];

        if (ownerId) {
          localStorage.setItem('owner_id', ownerId);
        }
        localStorage.setItem('restaurant_email', loginMail);
        localStorage.setItem('restaurant_ids', JSON.stringify(restaurantIds));

        if (restaurantIds.length > 0) {
          localStorage.setItem('restaurant_uuid', restaurantIds[0]);
        } else {
          localStorage.removeItem('restaurant_uuid');
        }

        this.navegarARestaurant();
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

  private navegarARestaurant(): void {
    this.cargando = false;
    this.router.navigate(['/restaurant'], { replaceUrl: true });
  }
}
