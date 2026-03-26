import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoggerService } from '../../core/services/logger.service';

@Component({
  selector: 'app-restaurant-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurant-login.component.html',
  styleUrls: ['./restaurant-login.component.css'],
})
export class RestaurantLoginComponent {

  showPassword = false;

  constructor(
    private router: Router,
    private logger: LoggerService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;

    this.logger.info('Toggle password visibility', {
      visible: this.showPassword
    });
  }

  login() {
    this.logger.info('Intento de login');

    // 🔹 Simulación (sin backend)
    const success = true;

    if (success) {
      this.logger.info('Login exitoso');

      this.router.navigate(['/restaurant']);
    } else {
      this.logger.error('Login fallido');
    }
  }

  goToRegister() {
    this.logger.info('Navegación a registro de restaurante');

    this.router.navigate(['/restaurant/register']);
  }
}