import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoggerService } from '../../core/services/logger.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-restaurant-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TranslateModule, 
  ],
  templateUrl: './restaurant-login.component.html',
  styleUrls: ['./restaurant-login.component.css'],
})
export class RestaurantLoginComponent {
  showPassword = false;
  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private logger: LoggerService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  login() {
    this.logger.info('Intento de login');
    // Si el login es exitoso, navegamos al dashboard
    // El idioma ya estará guardado en el localStorage gracias al Switch
    this.router.navigate(['/restaurant']);
  }

  goToRegister() {
    this.router.navigate(['/restaurant/register']);
  }
}