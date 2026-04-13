import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoggerService } from '../../core/services/logger.service';

@Component({
  selector: 'app-admin-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-create.html',
  styleUrl: './admin-create.css'
})
export class AdminCreate {

  correo: string = '';
  password: string = '';
  showPassword = false;

  errorCorreo = '';
  errorPassword = '';

  constructor(
    private router: Router,
    private logger: LoggerService
  ) {}

  agregar() {

    this.clearErrors();
    let valid = true;

    if (!this.correo.trim() || !this.correo.includes('@')) {
      this.errorCorreo = 'Correo inválido';
      valid = false;
    }

    if (!this.password.trim()) {
      this.errorPassword = 'Contraseña requerida';
      valid = false;
    }

    if (!valid) {
      this.logger.warn('Error al crear admin', {
        role: 'ADMIN',
        action: 'CREATE_ADMIN_ERROR'
      });
      return;
    }

    this.logger.info('Administrador creado', {
      role: 'ADMIN',
      action: 'CREATE_ADMIN_SUCCESS',
      email: this.correo
    });

    this.router.navigate(['/admin']);
  }

  clearErrors() {
    this.errorCorreo = '';
    this.errorPassword = '';
  }
}