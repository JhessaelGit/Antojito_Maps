import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-deleted',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './admin-deleted.html',
  styleUrls: ['./admin-deleted.css']
})
export class AdminDeletedComponent {

  constructor(
    private router: Router,
    private translate: TranslateService
  ) {}

  adminsEliminados = [
    { nombre: 'Juan Pérez', email: 'juan@gmail.com' },
    { nombre: 'Maria Lopez', email: 'maria@gmail.com' }
  ];

  restaurar(admin: any) {
    const mensaje = this.translate.instant('ADMIN_DELETED.ALERT_RESTORED');
    alert(`${mensaje}: ${admin.nombre}`);
  }

  volver() {
    this.router.navigate(['/admin']);
  }
}