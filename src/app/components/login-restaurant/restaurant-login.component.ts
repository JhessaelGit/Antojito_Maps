import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoggerService} from '../../core/services/logger.service';
import { TranslateModule } from '@ngx-translate/core'; // IMPORTANTE
import { RestauranteService } from '../../core/services/restaurante.service';

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
    this.logger.info('Intento de login');
    const success = true; 

    if (success) {
      this.logger.info('Login exitoso', {
        email: this.email
      });
      this.router.navigate(['/restaurant']);
    } else {
      this.logger.error('Login fallido');
    }

    this.cargando = true;
    this.logger.info('Intento de login', { email: this.email });

    this.restauranteService.login(this.email, this.password).subscribe({
      next: (data: any) => {
        this.cargando = false;
        this.logger.info('Login exitoso', { email: this.email });

        // Guardar uuid si el backend lo devuelve
        if (data?.uuid) {
          localStorage.setItem('restaurant_uuid', data.uuid);
        }
        // Guardar email para referencia
        localStorage.setItem('restaurant_email', this.email);

        this.router.navigate(['/restaurant']);
      },
      error: (err) => {
        this.cargando = false;
        this.logger.error('Login fallido');

        if (err.status === 401) {
          this.errorMsg = 'Correo o contraseña incorrectos';
        } else if (err.status === 0) {
          this.errorMsg = 'No se pudo conectar con el servidor';
        } else {
          this.errorMsg = 'Error al iniciar sesión. Intenta nuevamente';
        }
      }
    });
  }

  goToRegister() {
    this.logger.info('Navegación a registro de restaurante');
    this.router.navigate(['/restaurant/register']);
  }
}