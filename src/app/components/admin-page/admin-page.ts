import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
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
    private router:       Router,
    private location:     Location,
    private adminSession: AdminSessionService
  ) {}

  irAlInicio(): void {
  this.router.navigate(['/']);
}

  volverAtras(): void {
    this.location.back();
  }

  irGestionAdmins(): void {
  this.router.navigate(['/admin/manage']);
}

irSolicitudes(): void {
  this.router.navigate(['/admin/requests']);
}
}