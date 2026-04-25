import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoggerService } from '../../core/services/logger.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../core/services/admin.service';
import { AdminSessionService } from '../../core/services/admin-session.service';

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
  errorMsg = '';
  successMsg = '';
  cargando = false;
  fieldErrors: Record<string, string> = {};

  constructor(
    private router: Router,
    private logger: LoggerService,
    private translate: TranslateService,
    private adminService: AdminService,
    private adminSession: AdminSessionService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const currentSession = this.adminSession.getSession();
    if (!currentSession) {
      this.router.navigate(['/admin/login']);
      return;
    }

    this.correo = currentSession.mail;
  }

  agregar() {
    this.clearErrors();
    this.errorMsg = '';
    this.successMsg = '';
    this.fieldErrors = {};
    let valid = true;

    const mail = this.correo.trim().toLowerCase();
    const hadSession = this.adminSession.isAuthenticated();

    if (!mail || !mail.includes('@')) {
      this.errorCorreo = this.translate.instant('ADMIN_CREATE.ERR_EMAIL');
      valid = false;
    }

    if (!this.password || this.password.length < 6) {
      this.errorPassword = 'Mínimo 6 caracteres';
      valid = false;
    }

    if (!valid) {
      this.logger.warn('Validación fallida al crear admin', {
        role: 'ADMIN',
        action: 'CREATE_ADMIN_VALIDATION_ERROR',
        email: mail
      });
      return;
    }

    this.cargando = true;

    this.logger.info('Intento crear admin', {
      role: 'ADMIN',
      action: 'CREATE_ADMIN_ATTEMPT',
      email: mail,
      bootstrap: !hadSession
    });

    this.adminService.createAdmin(mail, this.password).subscribe({
      next: (response) => {
        this.cargando = false;
        this.successMsg = response?.message || 'Administrador creado correctamente';

        this.logger.info('Administrador creado', {
          role: 'ADMIN',
          action: 'CREATE_ADMIN_SUCCESS',
          email: mail
        });

        if (!hadSession) {
          this.router.navigate(['/admin/login']);
        } else {
          this.router.navigate(['/admin/editar']);
        }
      },
      error: (err) => {
        this.cargando = false;
        this.fieldErrors = err?.error?.validationErrors ?? {};

        if (this.fieldErrors['mail']) {
          this.errorCorreo = this.fieldErrors['mail'];
        }
        if (this.fieldErrors['password']) {
          this.errorPassword = this.fieldErrors['password'];
        }

        if (!hadSession && err?.status === 401) {
          this.errorMsg = err?.error?.message || 'Ya existen admins activos. Debes iniciar sesión.';
          this.router.navigate(['/admin/login']);
        } else if (err?.status === 400) {
          this.errorMsg = err?.error?.message || 'Datos inválidos o mail duplicado';
        } else if (err?.status === 0) {
          this.errorMsg = 'No se pudo conectar con el backend';
        } else {
          this.errorMsg = err?.error?.message || 'No se pudo crear el administrador';
        }

        this.logger.error('Error al crear admin', {
          role: 'ADMIN',
          action: 'CREATE_ADMIN_ERROR',
          status: err?.status,
          email: mail
        });
      }
    });
  }

  clearErrors() {
    this.errorCorreo = '';
    this.errorPassword = '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get passwordStrength(): { pct: number; level: string; label: string } {
    const p = this.password;
    if (!p) return { pct: 0, level: '', label: '' };
    let score = 0;
    if (p.length >= 6)  score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 2) return { pct: 33,  level: 'weak',   label: 'Contraseña débil' };
    if (score <= 3) return { pct: 66,  level: 'medium', label: 'Contraseña media' };
    return              { pct: 100, level: 'strong', label: 'Contraseña fuerte' };
  }

  volver(): void {
    this.location.back();
  }
}