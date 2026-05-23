import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-manage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-manage.html',
  styleUrl: './admin-manage.css'
})
export class AdminManageComponent {

  constructor(
    private router: Router,
    private location: Location
  ) {}

  volverAtras(): void {
    this.location.back();
  }

  irAgregar(): void {
    this.router.navigate(['/admin/agregar']);
  }

  irEditar(): void {
    this.router.navigate(['/admin/editar']);
  }

  irEliminados(): void {
    this.router.navigate(['/admin/eliminados']);
  }

  irEditados(): void {
    this.router.navigate(['/admin/editados']);
  }

  solicitudAceptada(): void {
    this.router.navigate(['/admin/aminmanage/solicitud-aceptada']);
  }
  solicitudDenegada(): void {
    this.router.navigate(['/admin/aminmanage/solicitud-denegada']);
  }
  solicitudEnEspera(): void {
    this.router.navigate(['/admin/aminmanage/solicitud-en-espera']);
  }
}