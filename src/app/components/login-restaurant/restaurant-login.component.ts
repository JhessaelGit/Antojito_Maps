import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoggerService } from '../../core/services/logger.service';

@Component({
  selector: 'app-restaurant-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-login.component.html',
  styleUrls: ['./restaurant-login.component.css'],
})
export class RestaurantLoginComponent {

  showPassword = false;

  email: string = '';
  password: string = '';

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

    // no se guarda en backend
    this.logger.info('Intento de login');

    const success = true;

    if (success) {

      // ✔ ahora usa el email real
      this.logger.info('Login exitoso', {
        email: this.email
      });

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