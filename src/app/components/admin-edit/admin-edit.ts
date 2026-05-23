import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../core/services/admin.service';
import { AdminSessionService } from '../../core/services/admin-session.service';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-admin-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './admin-edit.html',
  styleUrl: './admin-edit.css'
})
export class AdminEdit implements OnInit {
  editMail = '';
  editPassword = '';
  showPass = false;
  errorMsg = '';
  successMsg = '';
  guardando = false;
  fieldErrors: Record<string, string> = {};

  constructor(
    private router: Router,
    private adminService: AdminService,
    private adminSession: AdminSessionService,
    private translate: TranslateService,
    private location: Location,
    private zone: NgZone,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const currentSession = this.adminSession.getSession();
    if (!currentSession) {
      this.router.navigate(['/admin/login']);
      return;
    }
    this.editMail = currentSession.mail;
  }

  guardarEdicionPropia(): void {
    if (this.guardando) return; // Evita múltiples clics

    this.errorMsg = '';
    this.successMsg = '';
    this.fieldErrors = {};

    const mail = this.editMail.trim().toLowerCase();
    
    if (!mail || !mail.includes('@')) {
      this.errorMsg = this.translate.instant('ADMIN_CREATE.ERR_EMAIL');
      return;
    }
    if (!this.editPassword || this.editPassword.length < 6) {
      this.errorMsg = this.translate.instant('ADMIN_CREATE.ERR_PASSWORD');
      return;
    }

    this.guardando = true;

    this.adminService.editAdmin(mail, this.editPassword).pipe(
      timeout(5000), // Si en 5 segundos no hay respuesta, aborta
      finalize(() => {
        this.guardando = false;
      }),
      catchError(err => {
        // Manejo de errores de conexión
        if (err.name === 'TimeoutError') {
          this.errorMsg = 'Tiempo de espera agotado. El servidor no responde.';
        } else if (err.status === 0) {
          this.errorMsg = 'Servidor no detectado. Verifica que el backend esté corriendo.';
        } else {
          this.errorMsg = err?.error?.message || 'Error de comunicación con el servidor.';
        }
        return throwError(() => err);
      })
    ).subscribe({
      next: (response) => {
        this.zone.run(() => {
          this.successMsg = response?.message || 'Administrador actualizado correctamente';
          const session = this.adminSession.getSession();
          if (session) {
            this.adminSession.setSession({
              adminId: session.adminId,
              mail: (response?.mail || mail).trim().toLowerCase()
            });
          }
          this.editPassword = '';
          this.cd.detectChanges();
          setTimeout(() => { this.router.navigate(['/admin']); }, 1500);
        });
      },
      error: (err) => {
        this.zone.run(() => {
          this.fieldErrors = err?.error?.validationErrors ?? {};
          if (this.fieldErrors['mail']) this.errorMsg = this.fieldErrors['mail'];
          if (this.fieldErrors['password']) this.errorMsg = this.fieldErrors['password'];
          this.cd.detectChanges();
        });
      }
    });
  }

  volver(): void {
    this.location.back();
  }
}