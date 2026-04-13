import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoggerService } from '../../core/services/logger.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {

  correo: string = '';
  password: string = '';
  showPassword = false;

  constructor(
    private router: Router,
    private logger: LoggerService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;

    this.logger.info('Toggle password admin', {
      role: 'ADMIN',
      action: 'TOGGLE_PASSWORD'
    });
  }

  login(form: NgForm) {
    if (form.invalid) return;

    this.logger.info('Intento login admin', {
      email: this.correo,
      role: 'ADMIN',
      action: 'LOGIN_ATTEMPT'
    });

    const success = true;

    if (success) {
      this.logger.info('Login admin exitoso', {
        email: this.correo,
        role: 'ADMIN',
        action: 'LOGIN_SUCCESS'
      });

      this.router.navigate(['/restaurant']);
    } else {
      this.logger.error('Login admin fallido', {
        email: this.correo,
        role: 'ADMIN',
        action: 'LOGIN_ERROR'
      });
    }
  }
}