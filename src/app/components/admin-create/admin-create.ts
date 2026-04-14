import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoggerService } from '../../core/services/logger.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-create',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
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
    private logger: LoggerService,
    private translate: TranslateService
  ) {}

  agregar() {
    this.clearErrors();
    let valid = true;

    if (!this.nombre.trim()) {
      this.errorNombre = this.translate.instant('ADMIN_CREATE.ERR_NAME');
      valid = false;
    }

    if (!this.correo.includes('@')) {
      this.errorCorreo = this.translate.instant('ADMIN_CREATE.ERR_EMAIL');
      valid = false;
    }

    if (!this.funciones.trim()) {
      this.errorFunciones = this.translate.instant('ADMIN_CREATE.ERR_FUNCTIONS');
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