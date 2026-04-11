import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagina-principal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagina-principal.component.html',
  styleUrls: ['./pagina-principal.component.css']
})
export class PaginaPrincipalComponent {

  categorias = [
    { emoji: '🥟', nombre: 'Salteñas',       categoria: 'Típico boliviano', bg: 'bg1' },
    { emoji: '🍖', nombre: 'Chicharrón',      categoria: 'Cocina boliviana', bg: 'bg2' },
    { emoji: '🍔', nombre: 'Hamburguesas',    categoria: 'Fast food',        bg: 'bg3' },
    { emoji: '🍣', nombre: 'Sushi',           categoria: 'Japonesa',         bg: 'bg4' },
    { emoji: '🍕', nombre: 'Pizza',           categoria: 'Italiana',         bg: 'bg1' },
    { emoji: '🌮', nombre: 'Tacos',           categoria: 'Mexicana',         bg: 'bg5' },
    { emoji: '🍗', nombre: 'Pollo a la brasa',categoria: 'Parrilla',         bg: 'bg3' },
    { emoji: '🥩', nombre: 'Parrilla',        categoria: 'Asados',           bg: 'bg6' },
    { emoji: '🥗', nombre: 'Ensaladas',       categoria: 'Saludable',        bg: 'bg7' },
    { emoji: '☕', nombre: 'Cafeterías',      categoria: 'Desayunos',        bg: 'bg8' },
  ];

  constructor(private router: Router) {}

  selectRole(role: string): void {
    switch (role) {
      case 'usuario':      this.router.navigate(['/mapa']);  break;
      case 'restaurante':  this.router.navigate(['/restaurant/login']); break;
      case 'administrador':this.router.navigate(['/admin']); break;
    }
  }

  irAlMapa(): void {
    this.router.navigate(['/mapa']);
  }
}