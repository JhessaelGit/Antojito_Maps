import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; 
import { LanguageSwitchComponent } from '../language-switch/language-switch.component';

@Component({
  selector: 'app-pagina-principal',
  standalone: true,
  imports: [CommonModule, LanguageSwitchComponent, TranslateModule], 
  templateUrl: './pagina-principal.component.html',
  styleUrls: ['./pagina-principal.component.css']
})
export class PaginaPrincipalComponent {

  categorias = [
    { emoji: '🥟', nombre: 'Salteñas',          categoria: 'Típico boliviano', bg: 'bg1', slug: 'Salteñas' },
    { emoji: '🍖', nombre: 'Chicharrón',       categoria: 'Cocina boliviana', bg: 'bg2', slug: 'Chicharron' },
    { emoji: '🍔', nombre: 'Hamburguesas',     categoria: 'Fast food',        bg: 'bg3', slug: 'Hamburguesas' },
    { emoji: '🍣', nombre: 'Sushi',            categoria: 'Japonesa',         bg: 'bg4', slug: 'Sushi' },
    { emoji: '🍕', nombre: 'Pizza',            categoria: 'Italiana',         bg: 'bg1', slug: 'Pizzeria' },
    { emoji: '🌮', nombre: 'Tacos',            categoria: 'Mexicana',         bg: 'bg5', slug: 'Tacos' },
    { emoji: '🍗', nombre: 'Pollo a la brasa', categoria: 'Parrilla',         bg: 'bg3', slug: 'Pollo a la brasa' },
    { emoji: '🥩', nombre: 'Parrilla',         categoria: 'Asados',           bg: 'bg6', slug: 'Parrilla' },
    { emoji: '🥗', nombre: 'Ensaladas',        categoria: 'Saludable',        bg: 'bg7', slug: 'Ensaladas' },
    { emoji: '☕', nombre: 'Cafeterías',       categoria: 'Desayunos',        bg: 'bg8', slug: 'Cafeterias' },
  ];

  constructor(private router: Router, private translate: TranslateService) {
    const savedLang = localStorage.getItem('userLang') || 'es';
    this.translate.use(savedLang);
  }

  selectRole(role: string): void {
    switch (role) {
      case 'usuario':
        this.router.navigate(['/mapa']);
        break;

      case 'restaurante':
        this.router.navigate(['/restaurant/login']);
        break;

      case 'administrador':
        this.router.navigate(['/admin/login']);
        break;

      case 'registroRestaurante':
        this.router.navigate(['/restaurant/register']);
        break;
        
      default:
        this.router.navigate(['/mapa']);
        break;
    }
  }

  irAlMapa(): void {
    this.router.navigate(['/mapa']);
  }
}