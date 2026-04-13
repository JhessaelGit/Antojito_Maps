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

  errorMsg: string = '';
  cargando: boolean = false;

  constructor(
    public router: Router,
    private logger: LoggerService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;

    this.logger.info('Toggle password admin', {
      role: 'ADMIN',
      action: 'TOGGLE_PASSWORD',
      email: this.correo
    });
  }

  login(form: NgForm) {

    if (form.invalid) return;

    this.cargando = true;

    this.logger.info('Intento login admin', {
      email: this.correo,
      role: 'ADMIN',
      action: 'LOGIN_ATTEMPT'
    });

    // simulación (igual que antes, pero estructurado)
    const success = true;

    setTimeout(() => {

      this.cargando = false;

      if (success) {

        this.logger.info('Login admin exitoso', {
          email: this.correo,
          role: 'ADMIN',
          action: 'LOGIN_SUCCESS'
        });

        this.router.navigate(['/admin/restaurants']);

      } else {

        this.logger.error('Login admin fallido', {
          email: this.correo,
          role: 'ADMIN',
          action: 'LOGIN_ERROR'
        });

        this.errorMsg = 'Credenciales incorrectas';
      }

    }, 800); // simula llamada async
  }
}