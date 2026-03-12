import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './pagina-principal.component.html',
  styleUrls: ['./pagina-principal.component.css']
})
export class PaginaPrincipalComponent {

  constructor(private router: Router) { }

  /**
   * Maneja el clic en las tarjetas de rol
   * @param role Identificador del rol seleccionado
   */
  selectRole(role: string): void {
    if (role === 'usuario') {
      console.log('Navegando a la vista de Usuario...');
      this.router.navigate(['/mapa']); 
    } else if (role === 'restaurante') {
      console.log('Navegando a la vista de Restaurante...');
     
    } else if (role === 'administrador') {
      console.log('Navegando a la vista de Administrador...');
      
    }
  }

}