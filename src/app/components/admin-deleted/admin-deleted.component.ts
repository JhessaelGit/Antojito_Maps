import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-deleted',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-deleted.html',
  styleUrls: ['./admin-deleted.css']
})
export class AdminDeletedComponent {

  constructor(private router: Router) {}

  adminsEliminados = [
    { nombre: 'Juan Pérez', email: 'juan@gmail.com' },
    { nombre: 'Maria Lopez', email: 'maria@gmail.com' }
  ];

  restaurar(admin: any) {
    alert(`Restaurado: ${admin.nombre}`);
  }

  volver() {
    this.router.navigate(['/admin']);
  }
}