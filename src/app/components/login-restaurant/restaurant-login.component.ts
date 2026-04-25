import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoggerService} from '../../core/services/logger.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; 
import { RestaurantLoginResponse, RestauranteService } from '../../core/services/restaurante.service';

@Component({
  selector: 'app-restaurant-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
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
    public router: Router,
    private logger: LoggerService,
    private restauranteService: RestauranteService,
    private translate: TranslateService // Inyectado para traducciones dinámicas
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  public isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  login() {
    this.errorMsg = '';

    // Validar campos vacíos con traducción
    if (!this.email.trim() || !this.password.trim()) {
      this.translate.get('LOGIN.ERR_FILL_ALL').subscribe(res => this.errorMsg = res);
      return;
    }

    // Validar formato de correo con traducción
    if (!this.isValidEmail(this.email)) {
      this.translate.get('LOGIN.ERR_INVALID_EMAIL').subscribe(res => this.errorMsg = res);
      return;
    }

    this.cargando = true;
    const normalizedEmail = this.email.trim().toLowerCase();
    
    this.restauranteService.login(normalizedEmail, this.password).subscribe({
      next: (data: RestaurantLoginResponse) => {
        const ownerId = `${data?.ownerId ?? ''}`.trim();
        const loginMail = `${data?.mail ?? normalizedEmail}`.trim().toLowerCase();
        const restaurantIds = Array.isArray(data?.restaurantIds)
          ? data.restaurantIds.map((id) => `${id ?? ''}`.trim()).filter((id) => !!id)
          : [];

        if (ownerId) localStorage.setItem('owner_id', ownerId);
        localStorage.setItem('restaurant_email', loginMail);
        localStorage.setItem('restaurant_ids', JSON.stringify(restaurantIds));

        if (restaurantIds.length > 0) {
          localStorage.setItem('restaurant_uuid', restaurantIds[0]);
        }

        this.navegarARestaurant();
      },
      error: (err) => {
        this.cargando = false;
        if (err.status === 401) {
          this.errorMsg = 'Correo o contraseña incorrectos'; // Estas ya vienen del backend o puedes traducirlas igual
        } else {
          this.errorMsg = err?.error?.message || 'Error al iniciar sesión';
        }
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/restaurant/register']);
  }

  private navegarARestaurant(): void {
    this.cargando = false;
    this.router.navigate(['/restaurant'], { replaceUrl: true });
  }
}