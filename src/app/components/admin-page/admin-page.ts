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
    private adminSession: AdminSessionService
  ) {}

  irAgregar() {
    this.router.navigate(['/admin/agregar']);
  }

  irEditar() {
    this.router.navigate(['/admin/editar']);
  }

  irEliminados() {
    this.router.navigate(['/admin/eliminados']);
  }

  logout(): void {
    this.adminSession.clearSession();
    this.router.navigate(['/admin/login']);
  }
}