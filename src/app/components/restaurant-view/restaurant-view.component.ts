import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RestauranteService } from '../../core/services/restaurante.service';
import { Restaurante } from '../../core/models/restaurant.model';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-restaurant-view',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent], // Importamos los nuevos componentes
  templateUrl: './restaurant-view.html',
  styleUrl: './restaurant-view.css'
})
export class RestaurantView implements OnInit {
  restaurante?: Restaurante;
  promociones: any[] = []; // Esto vendrá del backend después

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restauranteService: RestauranteService
  ) {}

  ngOnInit(): void {
    window.scrollTo(0, 0);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Le pasamos el 'id' directamente como string, ya no usamos Number(id)
      this.cargarDatosRestaurante(id);
    }
  }

  cargarDatosRestaurante(id: string) {
    this.restauranteService.getRestauranteById(id).subscribe({
      next: (data: Restaurante) => {
        this.restaurante = data;
        this.promociones = [
          { id: 1, nombre: 'Combo Especial', desc: 'Descripción breve', precio: 25 },
          { id: 2, nombre: 'Duo Pack', desc: 'Ideal para compartir', precio: 45 }
        ];
      },
      error: (err: any) => { 
        console.error('Error al cargar restaurante', err);
      }
    });
  }

  volverAlMapa() {
    this.router.navigate(['/map-page']); 
  }
}