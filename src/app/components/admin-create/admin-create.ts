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

  nombre: string = '';
  correo: string = '';
  funciones: string = '';
  foto: File | null = null;
  preview: string | null = null;

  errorNombre = '';
  errorCorreo = '';
  errorFunciones = '';

  constructor(
    private router: Router,
    private logger: LoggerService
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.foto = file;

    const reader = new FileReader();
    reader.onload = e => {
      this.preview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  agregar() {

    this.clearErrors();
    let valid = true;

    if (!this.nombre.trim()) {
      this.errorNombre = 'Nombre requerido';
      valid = false;
    }

    if (!this.correo.includes('@')) {
      this.errorCorreo = 'Correo inválido';
      valid = false;
    }

    if (!this.funciones.trim()) {
      this.errorFunciones = 'Funciones requeridas';
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

    this.router.navigate(['/admin']); // volver a lista
  }

  clearErrors() {
    this.errorNombre = '';
    this.errorCorreo = '';
    this.errorFunciones = '';
  }
}