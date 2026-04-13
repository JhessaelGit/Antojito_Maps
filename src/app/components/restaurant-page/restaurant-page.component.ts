import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RestauranteService } from '../../core/services/restaurante.service';

@Component({
  selector: 'app-restaurant-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './restaurant-page.html',
  styleUrl: './restaurant-page.css',
})
export class RestaurantPage implements OnInit, OnDestroy {

  restaurantImage:    string | null = null;
  restaurantName:     string = 'Mi Restaurante';
  restaurantCategory: string = '';

  promociones: any[] = [
    {
      id: 1,
      nombre: '10% de descuento en Combo 1',
      descripcion: 'Papas + Arroz + 2 Presas + Refresco',
      precio: 21.6,
      fechaExpiracion: new Date(Date.now() + 86400000)
    }
  ];

  menu: any[] = [
    { id: 101, nombre: '2 Presas',  descripcion: 'Papas + arroz + 2 presas de pollo', precio: 45 },
    { id: 102, nombre: 'Combo 1',   descripcion: 'Papas + Arroz + 2 Presas + Refresco', precio: 35 }
  ];

  editandoItem = false;
  esPromo      = false;
  itemTemporal: any = {};
  mostrandoUndo       = false;
  ultimoItemEliminado: any = null;
  tipoItemEliminado: 'promo' | 'menu' | null = null;

  private timerUndo:           any;
  private timerCheckExpiracion: any;

  constructor(
    public  router:             Router,
    private restauranteService: RestauranteService
  ) {}

  ngOnInit() {
    const uuid = localStorage.getItem('restaurant_uuid');

    if (uuid) {
      this.restauranteService.getRestauranteById(uuid).subscribe({
        next: (data: any) => {
          this.restaurantName     = data.name      ?? localStorage.getItem('restaurant_name')     ?? 'Mi Restaurante';
          this.restaurantCategory = data.category  ?? localStorage.getItem('restaurant_category') ?? '';
          this.restaurantImage    = data.imagenUrl ?? data.image_url ?? localStorage.getItem('restaurant_image');
        },
        error: () => this.cargarDesdeLocalStorage()
      });
    } else {
      this.cargarDesdeLocalStorage();
    }

    this.timerCheckExpiracion = setInterval(() => this.verificarExpiracion(), 10000);
  }

  private cargarDesdeLocalStorage() {
    this.restaurantImage    = localStorage.getItem('restaurant_image');
    this.restaurantName     = localStorage.getItem('restaurant_name')     ?? 'Mi Restaurante';
    this.restaurantCategory = localStorage.getItem('restaurant_category') ?? '';
  }

  ngOnDestroy() {
    if (this.timerCheckExpiracion) clearInterval(this.timerCheckExpiracion);
    if (this.timerUndo)           clearTimeout(this.timerUndo);
  }

  verificarExpiracion() {
    const ahora = new Date();
    this.promociones = this.promociones.filter(p => new Date(p.fechaExpiracion) > ahora);
  }

  crearPromo() {
    this.esPromo = true;
    const ahora   = new Date();
    const offSet  = ahora.getTimezoneOffset() * 60000;
    const localISO = new Date(ahora.getTime() - offSet).toISOString().slice(0, 16);
    this.itemTemporal = {
      id: Date.now(), nombre: '', descripcion: '',
      precio: 0, fechaExpiracionFormateada: localISO
    };
    this.editandoItem = true;
  }

  editarPromo(promo: any) {
    this.esPromo = true;
    const date    = new Date(promo.fechaExpiracion);
    const offSet  = date.getTimezoneOffset() * 60000;
    const localISO = new Date(date.getTime() - offSet).toISOString().slice(0, 16);
    this.itemTemporal = { ...promo, fechaExpiracionFormateada: localISO };
    this.editandoItem = true;
  }

  editarMenu(item: any) {
    this.esPromo      = false;
    this.itemTemporal = { ...item };
    this.editandoItem = true;
  }

  guardarCambios() {
    if (this.esPromo) {
      this.itemTemporal.fechaExpiracion = new Date(this.itemTemporal.fechaExpiracionFormateada);
      const index = this.promociones.findIndex(p => p.id === this.itemTemporal.id);
      if (index !== -1) this.promociones[index] = { ...this.itemTemporal };
      else              this.promociones.push({ ...this.itemTemporal });
    } else {
      const index = this.menu.findIndex(m => m.id === this.itemTemporal.id);
      if (index !== -1) this.menu[index] = { ...this.itemTemporal };
      else              this.menu.push({ ...this.itemTemporal, id: Date.now() });
    }
    this.cerrarModal();
  }

  cerrarModal() {
    this.editandoItem = false;
    this.itemTemporal = {};
  }

  eliminarPromo(id: number) {
    this.ultimoItemEliminado = { ...this.promociones.find(p => p.id === id) };
    this.tipoItemEliminado   = 'promo';
    this.promociones         = this.promociones.filter(p => p.id !== id);
    this.mostrarNotificacionUndo();
  }

  eliminarMenu(id: number) {
    this.ultimoItemEliminado = { ...this.menu.find(m => m.id === id) };
    this.tipoItemEliminado   = 'menu';
    this.menu                = this.menu.filter(m => m.id !== id);
    this.mostrarNotificacionUndo();
  }

  mostrarNotificacionUndo() {
    this.mostrandoUndo = true;
    if (this.timerUndo) clearTimeout(this.timerUndo);
    this.timerUndo = setTimeout(() => this.mostrandoUndo = false, 5000);
  }

  deshacerEliminar() {
    if (this.tipoItemEliminado === 'promo') this.promociones.push(this.ultimoItemEliminado);
    else                                    this.menu.push(this.ultimoItemEliminado);
    this.mostrandoUndo = false;
    clearTimeout(this.timerUndo);
  }

  cerrarSesion() {
    localStorage.clear(); // Limpia todo para seguridad
    this.router.navigate(['/restaurant/login']);
  }
}