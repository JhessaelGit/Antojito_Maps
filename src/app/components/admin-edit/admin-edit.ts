import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoggerService } from '../../core/services/logger.service';

interface Admin {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-admin-edit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-edit.html',
  styleUrl: './admin-edit.css'
})
export class AdminEdit {

  admins: Admin[] = [
    { id: 1, nombre: 'admin 1' },
    { id: 2, nombre: 'admin 2' },
    { id: 3, nombre: 'admin 3' }
  ];

  constructor(
    private router: Router,
    private logger: LoggerService
  ) {}

  editar(admin: Admin) {
    this.logger.info('Editar admin', {
      role: 'ADMIN',
      action: 'EDIT_ADMIN',
      id: admin.id
    });
  }

  eliminar(admin: Admin) {
    this.logger.warn('Eliminar admin', {
      role: 'ADMIN',
      action: 'DELETE_ADMIN',
      id: admin.id
    });

    this.admins = this.admins.filter(a => a.id !== admin.id);
  }

  irCrear() {
    this.router.navigate(['/admin/create']);
  }
}