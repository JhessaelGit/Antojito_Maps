import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagina-principal',
  templateUrl: './pagina-principal.component.html',
  styleUrls: ['./pagina-principal.component.css']
})
export class PaginaPrincipalComponent {

  constructor(private router: Router) {}

  // Función para navegar cuando se haga clic en las opciones
  navegarA(ruta: string) {
    this.router.navigate([`/${ruta}`]);
  }
}