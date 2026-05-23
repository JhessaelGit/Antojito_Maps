import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AdminSessionService } from '../../core/services/admin-session.service';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css'
})
export class AdminPageComponent {

  constructor(
    private router: Router,
    public adminSession: AdminSessionService
  ) {}

  irAlInicio(): void {
    this.router.navigate(['/']);
  }

  cerrarSesion(): void {
    this.adminSession.clearSession();
    this.router.navigate(['/admin/login']);
  }

  irGestionAdmins(): void {
    this.router.navigate(['/admin/manage']);
  }

  irSolicitudes(): void {
    this.router.navigate(['/admin/requests']);
  }
}