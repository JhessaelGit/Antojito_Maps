import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoggerService } from '../../core/services/logger.service';

@Component({
  selector: 'app-register-restaurant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-restaurant.component.html',
  styleUrls: ['./register-restaurant.component.css'],
})
export class RegisterRestaurantComponent {

  showPassword = false;

  name: string = '';
  email: string = '';
  password: string = '';

  errorName: string = '';
  errorEmail: string = '';
  errorPassword: string = '';

  constructor(
    private router: Router,
    private logger: LoggerService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;

    this.logger.info('Toggle password visibility (register)', {
      visible: this.showPassword
    });
  }

  register() {
    this.logger.info('Intento de registro', {
      name: this.name,
      email: this.email
    });

    this.clearErrors();

    let valid = true;

    if (!this.name.trim()) {
      this.errorName = 'El nombre es obligatorio';
      this.logger.warn('Error validación: nombre vacío');
      valid = false;
    }

    if (!this.email.includes('@')) {
      this.errorEmail = 'Correo inválido';
      this.logger.warn('Error validación: correo inválido', {
        email: this.email
      });
      valid = false;
    }

    if (this.password.length < 6) {
      this.errorPassword = 'Mínimo 6 caracteres';
      this.logger.warn('Error validación: contraseña corta');
      valid = false;
    }

    if (!valid) {
      this.logger.warn('Registro fallido por validación');
      return;
    }

    // 🔹 Registro exitoso (simulado)
    this.logger.info('Registro exitoso', {
      name: this.name,
      email: this.email
    });

    this.router.navigate(['/restaurant/login']);
  }

  goToLogin() {
    this.logger.info('Navegación a login desde registro');

    this.router.navigate(['/restaurant/login']);
  }

  clearErrors() {
    this.errorName = '';
    this.errorEmail = '';
    this.errorPassword = '';
  }
}