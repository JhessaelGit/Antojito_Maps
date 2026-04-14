import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RestauranteService } from '../../core/services/restaurante.service';

@Component({
  selector: 'app-restaurant-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurant-view.html',
  styleUrl: './restaurant-view.css'
})
export class RestaurantView implements OnInit {

  restaurante: any = null;
  cargando = true;
  error    = false;

  // Datos de ejemplo hasta que el backend tenga endpoint de promociones
  promociones: any[] = [
    { id: 1, nombre: 'Combo Especial',  descripcion: 'Papas + Arroz + 2 Presas + Refresco', precio: 21.6,  descuento: '10%' },
    { id: 2, nombre: 'Duo Pack',        descripcion: 'Ideal para compartir — 2 platos + 2 bebidas',       precio: 45, descuento: '15%' }
  ];

  constructor(
    private route:   ActivatedRoute,
    private router:  Router,
    private restauranteService: RestauranteService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.cargar(id);
    else    this.error = true;
  }

  cargar(id: string) {
    this.cargando = true;
    this.restauranteService.getRestauranteById(id).subscribe({
      next: (data: any) => {
        this.restaurante = data;
        this.cargando    = false;
      },
      error: () => {
        this.error    = true;
        this.cargando = false;
      }
    });
  }

  volverAlMapa() {
    this.router.navigate(['/mapa']);
  }
}