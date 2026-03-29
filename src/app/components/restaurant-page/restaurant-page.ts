import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-restaurant-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-page.html',
  styleUrl: './restaurant-page.css',
})
export class RestaurantPage {
  promociones = [{ id: 1, nombre: '10% de descuento en Combo 1', descripcion: 'Papas + Arroz + 2 Presas + Refresco', precio: 21.6 }];
  menu = [
    { id: 101, nombre: '2 Presas', descripcion: 'Papas + arroz + 2 presas de pollo', precio: 45 },
    { id: 102, nombre: 'Combo 1', descripcion: 'Papas + Arroz + 2 Presas + Refresco', precio: 35 }
  ];

  // Variables para el Modal
  editandoItem: boolean = false;
  esPromo: boolean = false;
  itemTemporal: any = {};

  editarPromo(promo: any) {
    this.esPromo = true;
    this.abrirModal(promo);
  }

  editarMenu(item: any) {
    this.esPromo = false;
    this.abrirModal(item);
  }

  private abrirModal(item: any) {
    this.itemTemporal = { ...item };
    this.editandoItem = true;
  }

  cerrarModal() {
    this.editandoItem = false;
  }

  guardarCambios() {
    if (this.esPromo) {
      const index = this.promociones.findIndex(p => p.id === this.itemTemporal.id);
      this.promociones[index] = this.itemTemporal;
    } else {
      const index = this.menu.findIndex(m => m.id === this.itemTemporal.id);
      this.menu[index] = this.itemTemporal;
    }
    this.cerrarModal();
  }

// Variables para el Deshacer
  mostrandoUndo: boolean = false;
  ultimoItemEliminado: any = null;
  tipoItemEliminado: 'promo' | 'menu' | null = null;
  timerUndo: any;

  eliminarPromo(id: number) {
    const item = this.promociones.find(p => p.id === id);
    if (item) {
      this.ultimoItemEliminado = { ...item };
      this.tipoItemEliminado = 'promo';
      this.promociones = this.promociones.filter(p => p.id !== id);
      this.activarUndo();
    }
  }

  eliminarMenu(id: number) {
    const item = this.menu.find(m => m.id === id);
    if (item) {
      this.ultimoItemEliminado = { ...item };
      this.tipoItemEliminado = 'menu';
      this.menu = this.menu.filter(m => m.id !== id);
      this.activarUndo();
    }
  }

  activarUndo() {
    this.mostrandoUndo = true;
    if (this.timerUndo) clearTimeout(this.timerUndo);
    
    this.timerUndo = setTimeout(() => {
      this.mostrandoUndo = false;
      this.ultimoItemEliminado = null;
    }, 5000);
  }

  deshacerEliminar() {
    if (this.tipoItemEliminado === 'promo') {
      this.promociones.push(this.ultimoItemEliminado);
    } else if (this.tipoItemEliminado === 'menu') {
      this.menu.push(this.ultimoItemEliminado);
    }
    this.mostrandoUndo = false;
    this.ultimoItemEliminado = null;
    clearTimeout(this.timerUndo);
  }
}