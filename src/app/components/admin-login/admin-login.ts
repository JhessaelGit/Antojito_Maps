import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoggerService } from '../../core/services/logger.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../core/services/admin.service';
import { AdminSessionService } from '../../core/services/admin-session.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {

  correo: string = '';
  password: string = '';
  showPassword = false;

  errorMsg: string = '';
  cargando: boolean = false;
  fieldErrors: Record<string, string> = {};

  constructor(
    public router: Router,
    private logger: LoggerService,
    private translate: TranslateService,
    private adminService: AdminService,
    private adminSession: AdminSessionService
  ) {}

  ngOnInit(): void {
    if (this.adminSession.isAuthenticated()) {
      this.router.navigate(['/admin/restaurants']);
    }
  }

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
    this.errorMsg = '';
    this.fieldErrors = {};

    const mail = this.correo.trim().toLowerCase();

    this.logger.info('Intento login admin', {
      email: mail,
      role: 'ADMIN',
      action: 'LOGIN_ATTEMPT'
    });

    this.adminService.login(mail, this.password).subscribe({
      next: (response) => {
        this.cargando = false;
        const resolvedAdminId = response?.adminId ?? response?.id ?? response?.uuid;

        if (!resolvedAdminId || !response?.mail) {
          this.errorMsg = 'Respuesta inválida del backend en login admin';
          return;
        }

        this.adminSession.setSession({
          adminId: resolvedAdminId,
          mail: response.mail
        });

        this.logger.info('Login admin exitoso', {
          email: response.mail,
          role: 'ADMIN',
          action: 'LOGIN_SUCCESS',
          adminId: resolvedAdminId
        });

        this.router.navigate(['/admin/restaurants']);
      },
      error: (err) => {
        this.cargando = false;
        this.fieldErrors = err?.error?.validationErrors ?? {};

        if (err?.status === 401) {
          this.errorMsg = err?.error?.message || this.translate.instant('ADMIN_LOGIN.ERR_CREDENTIALS');
        } else if (err?.status === 0) {
          this.errorMsg = 'No se pudo conectar con el backend';
        } else {
          this.errorMsg = err?.error?.message || 'No se pudo iniciar sesión como admin';
        }

        this.logger.error('Login admin fallido', {
          email: mail,
          role: 'ADMIN',
          action: 'LOGIN_ERROR',
          status: err?.status
        });
      }
    });
  }
}